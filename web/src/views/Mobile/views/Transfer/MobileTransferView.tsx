import AccountSelect from '@components/AccountSelect';
import Button from '@components/ui/Button';
import PriceField from '@components/ui/Fields/PriceField';
import NewBalance from '@components/ui/NewBalance';
import { Heading2, Heading5 } from '@components/ui/Typography/Headings';
import { accountsAtom } from '@data/accounts';
import { transactionBaseAtom } from '@data/transactions';
import { useConfig } from '@hooks/useConfig';
import { Alert, Stack } from '@mui/material';
import { Box } from '@mui/system';
import { TransactionEvents } from '@typings/Events';
import { CreateTransferInput, TransferType } from '@typings/Transaction';
import { formatMoney } from '@utils/currency';
import { fetchNui } from '@utils/fetchNui';
import { useAtom } from 'jotai';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const MobileTransferView = () => {
  const { t } = useTranslation();
  const { general } = useConfig();

  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedFromAccountId, setSelectedFromAccountId] = useState<number>();
  const [selectedToAccountId, setSelectedToAccountId] = useState<number>();
  const [accounts, updateAccounts] = useAtom(accountsAtom);
  const [, updateTransactions] = useAtom(transactionBaseAtom);

  const selectedFromAccount = accounts.find((account) => account.id === selectedFromAccountId);

  const rawValue = parseInt(amount.replace(/\D/g, ''));
  const value = isNaN(rawValue) ? 0 : rawValue;
  const newBalance = (selectedFromAccount?.balance ?? 0) - value;
  const isValidNewBalance = newBalance >= 0;
  const isValidTransaction =
    Boolean(amount) && value > 0 && selectedFromAccountId && selectedToAccountId;
  const isSameAccount = selectedFromAccountId === selectedToAccountId;
  const isButtonDisabled = !isValidNewBalance || !isValidTransaction || isSameAccount || isLoading;

  const isExternalTransfer = Boolean(selectedToAccountId && selectedToAccountId < 1);
  const message = isExternalTransfer ? t('External transfer') : t('Internal transfer');
  const type = isExternalTransfer ? TransferType.External : TransferType.Internal;

  const handleTransfer = async () => {
    if (!selectedFromAccountId || !selectedToAccountId) {
      return;
    }

    setIsLoading(true);
    const transfer: CreateTransferInput = {
      amount: value,
      fromAccountId: selectedFromAccountId,
      toAccountId: isExternalTransfer ? selectedToAccountId * 10 : selectedToAccountId,
      message,
      type,
    };

    await fetchNui(TransactionEvents.CreateTransfer, transfer);
    setSuccess(t('Successfully transferred {{amount}}.', { amount: formatMoney(value, general) }));
    setIsLoading(false);
    updateAccounts();
    updateTransactions();
    setAmount('');
  };

  return (
    <Box p={4}>
      <Stack spacing={0.25}>
        <Heading2>{t('Transfer funds')}</Heading2>
        <Heading5>{t('Transfer between internal & external accounts.')}</Heading5>
      </Stack>

      <Stack spacing={4} marginTop={4}>
        <Stack spacing={1}>
          <Heading5>{t('From account')}</Heading5>
          <AccountSelect
            isFromAccount
            accounts={accounts}
            onSelect={setSelectedFromAccountId}
            selectedId={selectedFromAccountId}
          />
        </Stack>

        <Stack spacing={1}>
          <Heading5>{t('To account')}</Heading5>
          <AccountSelect
            accounts={accounts}
            onSelect={setSelectedToAccountId}
            selectedId={selectedToAccountId}
          />
        </Stack>

        <Stack spacing={1}>
          <Heading5>{t('Amount')}</Heading5>
          <PriceField value={amount} onChange={(event) => setAmount(event.target.value)} />
          <NewBalance amount={newBalance} isValid={isValidNewBalance} />
        </Stack>

        <Button size="large" onClick={handleTransfer} disabled={isButtonDisabled}>
          {t('Transfer funds')}
        </Button>

        {success && (
          <Alert color="info" variant="outlined" sx={{ color: '#fff' }}>
            {success}
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default MobileTransferView;
