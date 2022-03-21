import { Account, AccountRole, CreateAccountInput, SharedAccountInput } from '@typings/Account';
import { AccountErrors, AuthorizationErrors } from '@typings/Errors';
import { ServerError } from '@utils/errors';
import { ExternalAccountDB } from 'services/accountExternal/externalAccount.db';
import { singleton } from 'tsyringe';
import { AccountModel } from './account.model';
import { SharedAccountModel } from './sharedAccount.model';

export interface RemoveFromSharedAccountInput {
  accountId: number;
  identifier: string;
}

@singleton()
export class AccountDB {
  _externalAccountDB: ExternalAccountDB;

  constructor(externalAccountDB: ExternalAccountDB) {
    this._externalAccountDB = externalAccountDB;
  }

  async getAccounts(): Promise<AccountModel[]> {
    return await AccountModel.findAll();
  }

  async getDefaultAccountByIdentifier(identifier: string): Promise<AccountModel | null> {
    return await AccountModel.findOne({
      where: { isDefault: true, ownerIdentifier: identifier },
    });
  }

  async getAccountsByIdentifier(identifier: string): Promise<AccountModel[]> {
    return await AccountModel.findAll({ where: { ownerIdentifier: identifier } });
  }

  // TODO: Move into separate DB
  async getSharedAccountsByIdentifier(identifier: string): Promise<SharedAccountModel[]> {
    return await SharedAccountModel.findAll({
      where: { user: identifier },
      include: [{ model: AccountModel, as: 'account' }],
    });
  }

  async getSharedAccountsById(id: number): Promise<SharedAccountModel[]> {
    return await SharedAccountModel.findAll({
      where: { accountId: id },
      include: [{ model: AccountModel, as: 'account' }],
    });
  }

  async getAuthorizedSharedAccountById(
    id: number,
    identifier: string,
    roles: AccountRole[],
  ): Promise<AccountModel | null> {
    const sharedAccount = await SharedAccountModel.findOne({
      where: { accountId: id, user: identifier },
      include: [{ model: AccountModel, as: 'account' }],
    });

    const role = sharedAccount?.getDataValue('role') ?? AccountRole.Contributor;
    if (!roles.includes(role)) {
      throw new ServerError(AuthorizationErrors.Forbidden);
    }

    return sharedAccount?.getDataValue('account') as unknown as AccountModel;
  }

  async getAccount(id: number): Promise<AccountModel | null> {
    return await AccountModel.findOne({ where: { id } });
  }

  async getAuthorizedAccountById(id: number, identifier: string): Promise<AccountModel | null> {
    return await AccountModel.findOne({ where: { id, ownerIdentifier: identifier } });
  }

  async getAccountByNumber(number: string): Promise<AccountModel | null> {
    return await AccountModel.findOne({ where: { number } });
  }

  async editAccount(input: Partial<Account>) {
    return await AccountModel.update(input, {
      where: { id: input.id, ownerIdentifier: input.ownerIdentifier },
    });
  }

  async createAccount(account: CreateAccountInput): Promise<AccountModel> {
    return await AccountModel.create(account);
  }

  async createSharedAccount(input: SharedAccountInput): Promise<SharedAccountModel> {
    // TODO: Move logic into service
    const existingAccount = await SharedAccountModel.findOne({
      where: { user: input.user, accountId: input.accountId },
    });

    if (existingAccount) {
      throw new ServerError(AccountErrors.AlreadyExists);
    }

    const account = await SharedAccountModel.create({
      ...input,
      role: input.role ?? AccountRole.Contributor,
    });

    // TODO: How to extend the module to support this with ts? Other ORM might be a choice if this isn't fixable.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    await account.setAccount(input.accountId);
    return account;
  }

  async deleteSharedAccount(id: number) {
    return await SharedAccountModel.findOne({ where: { id } });
  }

  async deleteAccount(id: number) {
    return await AccountModel.destroy({ where: { id } });
  }

  async updateAccountBalance(): Promise<void> {
    throw new Error('Not implemented');
  }
}
