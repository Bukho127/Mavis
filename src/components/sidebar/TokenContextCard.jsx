import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import promoImage from "../../assets/Background/token-promo.jpg";
import { decodeUserIdFromToken, getQuota } from "../../api";
import { useAuth } from "../../context/AuthContext";

function TokenContextCard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const userId = token ? decodeUserIdFromToken(token) : null;
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    if (!userId || !token) return;

    const loadQuota = async () => {
      const data = await getQuota(userId, token);
      setQuota(data);
    };

    loadQuota().catch(console.error);

    const interval = setInterval(() => {
      loadQuota().catch(console.error);
    }, 15000);

    return () => clearInterval(interval);
  }, [userId, token]);

  const handleUpgradeClick = () => {
    navigate("/dashboard/billing");
  };

  const tokensUsed = quota?.tokenUsage ?? 0;
  const tokensTotal = quota?.tokenLimit ?? 100000;
  const percentUsed = quota?.percentUsed ?? 0;
  const nearLimit = percentUsed >= 85;

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <img src={promoImage} alt="" className="h-20 w-full object-cover" />

      <div className="p-3">
        <p className="text-sm font-semibold text-stone-900">
          Token &amp; Context
        </p>

        <p className="mt-1 text-xs text-stone-500">
          Tokens used
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs text-stone-500">
            <div className="h-5 w-5">
              <CircularProgressbar
                value={percentUsed}
                strokeWidth={16}
                styles={{
                  path: {
                    stroke: nearLimit ? "#dc2626" : "#3b82f6",
                  },
                }}
              />
            </div>

            {tokensUsed.toLocaleString()} of {tokensTotal.toLocaleString()}
          </span>

          <button
            type="button"
            onClick={handleUpgradeClick}
            className="cursor-pointer rounded bg-stone-900 px-2.5 py-1 text-xs font-semibold text-white"
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}

export default TokenContextCard;
