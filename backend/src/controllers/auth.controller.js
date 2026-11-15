import * as authService from '../services/auth.service.js';

export async function sendOtp(req, res, next) {
  try {
    const { email } = req.body;
    const result = await authService.sendRegistrationOtp(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyRegistrationOtp(email, otp);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    const data = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const data = await authService.loginUser(email, password);
    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const data = await authService.getCurrentUser(req.user.id);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}
