import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Refresh01Icon } from "@hugeicons/core-free-icons";
import promoImage from "../../assets/Background/token-promo.jpg";

function TokenContextCard({ tokensUsed = 89, tokensTotal = 300 }) {
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    navigate("/dashboard/billing");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <img src={promoImage} alt="" className="h-20 w-full object-cover" />

      <div className="p-3">
        <p className="text-sm font-semibold text-stone-900">Token &amp; Context</p>
        <p className="mt-1 text-xs text-stone-500">Tokens used this session</p>

        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-stone-500">
            <HugeiconsIcon icon={Refresh01Icon} size={12} />
            {tokensUsed} of {tokensTotal}K
          </span>
          <button
            type="button"
            onClick={handleUpgradeClick}
            className="rounded bg-stone-900 px-2.5 py-1 text-xs font-semibold text-white cursor-pointer "
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}

export default TokenContextCard;