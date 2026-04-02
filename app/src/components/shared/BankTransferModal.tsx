"use client";

import { useState, useCallback } from "react";
import { X, Ticket, Loader2, Copy, Check, CheckCircle } from "lucide-react";
import { createManualPurchase } from "@/lib/actions/tasalbar";
import {
  BANK_NAME,
  BANK_ACCOUNT,
  BANK_ACCOUNT_NAME,
  BANK_IBAN,
} from "@/lib/constants/packages";

interface BankTransferModalProps {
  purchase: { id: string; name: string; amount: number; priceMNT: number };
  paymentId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BankTransferModal({
  purchase,
  paymentId,
  onClose,
  onSuccess,
}: BankTransferModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const handleSubmitPurchase = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await createManualPurchase(
        purchase.id,
        purchase.amount,
        purchase.priceMNT
      );
      if (!result.success) {
        setError(result.error || "Алдаа гарлаа");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }, [purchase]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-t-2xl sm:rounded-2xl w-full max-w-sm sm:mx-6 relative max-h-[85dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        <div className="sticky top-0 bg-zinc-900 z-10 p-4 pb-0 flex items-center justify-between">
          <h3 className="font-bold text-lg">Төлбөр төлөх</h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 pb-8">
          {success ? (
            <div className="text-center py-6">
              <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
              <h4 className="font-bold text-lg">Хүсэлт илгээгдлээ!</h4>
              <p className="text-sm text-white/50 mt-2">
                Банкны шилжүүлэг хийсний дараа админ баталгаажуулахад таны
                тасалбар орно.
              </p>
              <button
                onClick={onSuccess}
                className="mt-4 bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-xl"
              >
                Ойлголоо
              </button>
            </div>
          ) : (
            <>
              {/* Purchase summary */}
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{purchase.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {purchase.amount} тасалбар
                    </p>
                  </div>
                  <span className="font-black text-lg text-yellow-400">
                    {purchase.priceMNT.toLocaleString()}₮
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {/* Bank details */}
              <div className="space-y-3">
                <p className="text-xs text-white/50 font-medium uppercase tracking-wider">
                  Дансны мэдээлэл
                </p>

                <div className="p-3 rounded-xl bg-white/5 space-y-2.5">
                  <div>
                    <p className="text-[10px] text-white/30">Банк</p>
                    <p className="text-sm font-medium">{BANK_NAME}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/30">
                        Дансны дугаар
                      </p>
                      <p className="text-sm font-mono font-medium">
                        {BANK_ACCOUNT}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(BANK_ACCOUNT, "account")}
                      className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5"
                    >
                      {copiedField === "account" ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/30">Дансны нэр</p>
                      <p className="text-sm font-medium">
                        {BANK_ACCOUNT_NAME}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(BANK_ACCOUNT_NAME, "name")}
                      className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5"
                    >
                      {copiedField === "name" ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>

                  {BANK_IBAN && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-white/30">IBAN</p>
                        <p className="text-sm font-mono font-medium">
                          {BANK_IBAN}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(BANK_IBAN, "iban")}
                        className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5"
                      >
                        {copiedField === "iban" ? (
                          <Check size={14} className="text-green-400" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Transfer description */}
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-[10px] text-white/30 mb-1">
                    Гүйлгээний утга (заавал бичнэ!)
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-mono font-bold text-purple-300">
                      {paymentId} {purchase.amount}
                    </p>
                    <button
                      onClick={() =>
                        handleCopy(
                          `${paymentId} ${purchase.amount}`,
                          "desc"
                        )
                      }
                      className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5"
                    >
                      {copiedField === "desc" ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">
                    Таны ID: {paymentId} • Тасалбар: {purchase.amount}
                  </p>
                </div>

                {/* Amount */}
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-[10px] text-white/30 mb-1">
                    Шилжүүлэх дүн
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">
                      {purchase.priceMNT.toLocaleString()}₮
                    </p>
                    <button
                      onClick={() =>
                        handleCopy(String(purchase.priceMNT), "amount")
                      }
                      className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5"
                    >
                      {copiedField === "amount" ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitPurchase}
                disabled={loading}
                className="w-full mt-4 bg-yellow-500 text-black font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Ticket size={16} />
                    Шилжүүлэг хийсэн, хүсэлт илгээх
                  </>
                )}
              </button>
              <p className="text-[10px] text-white/30 text-center mt-2">
                Шилжүүлэг хийсний дараа дарна уу. Админ шалгаад тасалбар
                олгоно.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
