import { prisma, query } from '../config/database.js';

export async function getContractById(userId, contractId) {
  const contract = await prisma.contracts.findUnique({
    where: { id: contractId },
    include: {
      projects: {
        include: {
          categories: true,
        },
      },
      users_contracts_client_idTousers: {
        select: {
          id: true,
          name: true,
          email: true,
          client_profiles: true,
        },
      },
      users_contracts_freelancer_idTousers: {
        select: {
          id: true,
          name: true,
          email: true,
          freelancer_profiles: true,
        },
      },
      milestones: {
        orderBy: { created_at: 'asc' },
      },
      reviews: true,
    },
  });

  if (!contract) {
    const error = new Error('Contract not found.');
    error.statusCode = 404;
    throw error;
  }

  // Access check: must be client, freelancer, or admin
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (
    contract.client_id !== userId &&
    contract.freelancer_id !== userId &&
    user.role !== 'ADMIN'
  ) {
    const error = new Error('Unauthorized to view this contract.');
    error.statusCode = 403;
    throw error;
  }

  return contract;
}

export async function getUserContracts(userId, role) {
  const where = role === 'CLIENT' ? { client_id: userId } : { freelancer_id: userId };

  const contracts = await prisma.contracts.findMany({
    where,
    include: {
      projects: {
        select: { id: true, title: true, status: true },
      },
      users_contracts_client_idTousers: {
        select: { id: true, name: true, email: true },
      },
      users_contracts_freelancer_idTousers: {
        select: { id: true, name: true, email: true },
      },
      milestones: {
        select: { id: true, title: true, amount: true, status: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return contracts;
}

/**
 * Complete contract using PostgreSQL stored procedure: complete_contract(p_contract_id, p_user_id)
 * Atomically validates all milestones are PAID, closes contract, closes project, increments counters.
 */
export async function completeContract(userId, contractId) {
  await query('CALL complete_contract($1, $2);', [contractId, userId]);

  const contract = await getContractById(userId, contractId);
  return {
    success: true,
    message: 'Contract completed successfully.',
    contract,
  };
}
