import { useEffect } from "react";
import { toast } from "sonner";

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
    // Initial delay so it doesn't pop up immediately
    const timeout = setTimeout(() => {
      showToast();
      const interval = setInterval(showToast, 30000);
      return () => clearInterval(interval);
    }, 30000);

    function showToast() {
      const amount = Math.floor(Math.random() * (37000 - 5000 + 1) + 5000);
      const name = INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)];
      const phone = generateMaskedPhone();

      toast.success("💸 WITHDRAWAL SUCCESSFUL", {
        description: `${name} (${phone}) withdrew ₹${amount.toLocaleString('en-IN')}`,
        position: "bottom-center",
        duration: 5000,
        className: "glass-card border-green-500/30 text-green-500",
      });
    }

    return () => clearTimeout(timeout);
  }, []);
}
