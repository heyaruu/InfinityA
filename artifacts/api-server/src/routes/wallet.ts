import { Router, type IRouter } from "express";
import { RequestWithdrawalBody, GetWalletResponse, RequestWithdrawalResponse } from "@workspace/api-zod";
import { getWalletSummary, requestWithdrawal, InsufficientBalanceError } from "../lib/wallet";

const router: IRouter = Router();

router.get("/wallet", async (_req, res): Promise<void> => {
  const wallet = await getWalletSummary();
  res.json(GetWalletResponse.parse(wallet));
});

router.post("/wallet/withdraw", async (req, res): Promise<void> => {
  const parsed = RequestWithdrawalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const wallet = await requestWithdrawal(parsed.data.amount);
    res.json(RequestWithdrawalResponse.parse(wallet));
  } catch (err) {
    if (err instanceof InsufficientBalanceError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
});

export default router;
