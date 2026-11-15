import * as contractService from '../services/contract.service.js';

export async function getById(req, res, next) {
  try {
    const contract = await contractService.getContractById(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      data: contract,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserContracts(req, res, next) {
  try {
    const contracts = await contractService.getUserContracts(req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      data: contracts,
    });
  } catch (error) {
    next(error);
  }
}

export async function complete(req, res, next) {
  try {
    const result = await contractService.completeContract(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
