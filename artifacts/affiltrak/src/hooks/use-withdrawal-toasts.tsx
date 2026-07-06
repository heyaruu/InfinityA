import { useEffect } from "react";
import { toast } from "sonner";
import { IndianRupee } from "lucide-react";

const INDIAN_NAMES = [
  "Aarav Patel", "Vihaan Sharma", "Vivaan Kumar", "Ananya Singh", "Diya Gupta",
  "Aditya Das", "Riya Mehta", "Arjun Reddy", "Saisha Joshi", "Sai Kumar",
  "Ishaan Verma", "Kavya Jain", "Krishna Iyer", "Saanvi Rao", "Dhruv Menon",
  "Aarohi Nair", "Kabir Desai", "Pari Bhatt", "Ritvik Pillai", "Neha Chauhan",
  "Rohan Gupta", "Priya Singh", "Amit Patel", "Sneha Sharma", "Rahul Kumar",
  "Megha Verma", "Karan Jain", "Anjali Iyer", "Rajesh Rao", "Swati Menon"
];

function generateMaskedPhone() {
  const first2 = Math.floor(Math.random() * 10 + 90); // 90-99
  const last2 = Math.floor(Math.random() * 90 + 10);
  return `+91 ${first2}****${last2.toString().padStart(2, '0')}`;
}

export function useWithdrawalToasts() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      showToast();
      const interval = setInterval(showToast, 30000);
      return () => clearInterval(interval);
    }, 30000);

    function showToast() {
      const amount = Math.floor(Math.random() * (37000 - 5000 + 1) + 5000);
      const name = INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)];
      const shortName = `${name.split(" ")[0]} ${name.split(" ")[1]?.[0] ?? ""}.`;
      const phone = generateMaskedPhone();

      toast.custom(
        () => (
          <div className="withdrawal-toast rounded-2xl px-4 py-4 flex items-center gap-3 w-[340px] max-w-[90vw]">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#031a11]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-emerald-400 font-bold text-xs tracking-wide flex items-center gap-1.5">
                💸 WITHDRAWAL SUCCESSFUL
              </p>
              <p className="text-white font-extrabold text-2xl font-mono tracking-tight mt-0.5">
                ₹{amount.toLocaleString('en-IN')}
              </p>
              <p className="text-slate-400 text-sm mt-0.5 truncate">
                {shortName} <span className="text-slate-500">•</span> {phone}
              </p>
            </div>
          </div>
        ),
        {
          position: "bottom-center",
          duration: 5000,
        }
      );
    }

    return () => clearTimeout(timeout);
  }, []);
}
