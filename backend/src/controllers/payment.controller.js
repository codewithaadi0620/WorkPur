import * as paymentService from '../services/payment.service.js';

export async function getWallet(req, res, next) {
  try {
    const data = await paymentService.getUserWallet(req.user.id);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deposit(req, res, next) {
  try {
    const { amount, description } = req.body;
    const result = await paymentService.depositFunds(req.user.id, parseFloat(amount), description);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function withdraw(req, res, next) {
  try {
    const { amount } = req.body;
    const result = await paymentService.withdrawFunds(req.user.id, parseFloat(amount));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
