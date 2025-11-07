import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import express from "express";
import dotenv from "dotenv";
import PlaidItem from "../models/PlaidItem.js";
import { authenticateToken } from "../middlewares/auth.js";

dotenv.config({override:true, quiet: true})

const router = express.Router()

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET_KEY,
      "Plaid-Version": process.env.PLAID_API_VERSION
    }
  }
});

const client = new PlaidApi(configuration);
console.log("PLAID_ENV:", process.env.PLAID_ENV);


router.post("/api/create_link_token", authenticateToken, async (req, res) => {
  try {
    const response = await client.linkTokenCreate({
      user: {
        client_user_id: req.user._id.toString(),
      },
      client_name: "PFM Dashboard",
      products: ["transactions"],
      country_codes: ["US"],
      language: "en",
    });
    const linkToken = response.data.link_token;
    res.json({ linkToken });
  } catch (err) {
    console.error("Error creating link_token:", err.response ? err.response.data : err);
    res.status(500).json({ error: "Could not create link token" });
  }
});

// Sandbox test route - only for development
router.post("/api/sandbox/create_public_token", authenticateToken, async (req, res) => {
  if (process.env.PLAID_ENV !== 'sandbox') {
    return res.status(403).json({ error: "Only available in sandbox environment" });
  }
  
  try {
    // Create sandbox public token for testing
    const response = await client.sandboxPublicTokenCreate({
      institution_id: "ins_109508", // Chase Bank sandbox ID
      initial_products: ["transactions"]
    });
    
    res.json({ 
      publicToken: response.data.public_token,
      message: "Use this publicToken to test /api/exchange_public_token"
    });
  } catch (err) {
    console.error("Error creating sandbox public token:", err.response ? err.response.data : err);
    res.status(500).json({ error: "Could not create sandbox public token" });
  }
});

/**
 * POST /api/exchange_public_token
 * Receives public_token from frontend; exchanges it for access_token + item_id
 */
router.post("/api/exchange_public_token", authenticateToken, async (req, res) => {
  try {
    const { publicToken } = req.body;
    const exchangeResp = await client.itemPublicTokenExchange({ public_token: publicToken });
    const { access_token, item_id } = exchangeResp.data;

    // Get institution info
    const itemResp = await client.itemGet({ access_token });
    const { institution_id } = itemResp.data.item;
    const instResp = await client.institutionsGetById({ institution_id, country_codes: ["US"] });
    const institutionName = instResp.data.institution.name;

    // Store in database
    await PlaidItem.create({
      userId: req.user._id,
      accessToken: access_token,
      itemId: item_id,
      institutionId: institution_id,
      institutionName
    });

    res.json({ accessToken: access_token, itemId: item_id });
  } catch (err) {
    console.error("Error exchanging public token:", err.response ? err.response.data : err);
    res.status(500).json({ error: "Token exchange failed" });
  }
});

/**
 * GET /api/accounts/:userId
 * Fetch accounts and balances for a user
 */
router.get("/api/accounts", authenticateToken, async (req, res) => {
  try {
    const plaidItem = await PlaidItem.findOne({ userId: req.user._id });
    if (!plaidItem) {
      return res.status(404).json({ error: "No Plaid account found for user" });
    }

    const accountsResp = await client.accountsGet({ access_token: plaidItem.accessToken });
    const accounts = accountsResp.data.accounts;
    res.json({ accounts });
  } catch (err) {
    console.error("Error fetching accounts:", err.response ? err.response.data : err);
    res.status(500).json({ error: "Could not fetch accounts" });
  }
});

/**
 * GET /api/transactions/:userId
 * Fetch transactions (e.g. last 30 days)
 */
router.get("/api/transactions", authenticateToken, async (req, res) => {
  try {
    const plaidItem = await PlaidItem.findOne({ userId: req.user._id });
    if (!plaidItem) {
      return res.status(404).json({ error: "No Plaid account found for user" });
    }

    const now = new Date();
    const endDate = now.toISOString().split("T")[0];
    const prior = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = prior.toISOString().split("T")[0];

    const txResp = await client.transactionsGet({
      access_token: plaidItem.accessToken,
      start_date: startDate,
      end_date: endDate
    });
    const transactions = txResp.data.transactions;
    res.json({ transactions });
  } catch (err) {
    console.error("Error fetching transactions:", err.response ? err.response.data : err);
    res.status(500).json({ error: "Could not fetch transactions" });
  }
});

export default router;