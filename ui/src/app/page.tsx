"use client";

import { useMemo, useState } from "react";
import type { ComponentProps, ComponentType } from "react";
import {
  AcademicCapIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  BanknotesIcon,
  Bars3Icon,
  BellAlertIcon,
  BoltIcon,
  BriefcaseIcon,
  CalendarIcon,
  ChartPieIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  HeartIcon,
  HomeIcon,
  MapPinIcon,
  PlusIcon,
  ShoppingBagIcon,
  SparklesIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

type IconComponent = ComponentType<ComponentProps<"svg">>;

type WalletType = "Tiền mặt" | "Ngân hàng" | "Ví điện tử" | "Đầu tư";

type Wallet = {
  id: string;
  name: string;
  balance: number;
  type: WalletType;
  color: string;
  lastSyncedAt: string;
};

type CategoryChild = {
  id: string;
  name: string;
  icon: IconComponent;
};

type Category = {
  id: string;
  name: string;
  type: "expense" | "income";
  icon: IconComponent;
  children: CategoryChild[];
};

type Transaction = {
  id: string;
  walletId: string;
  amount: number;
  categoryId: string;
  subCategoryId?: string;
  type: "expense" | "income";
  date: string;
  description: string;
  location?: string;
};

type EventLog = {
  id: string;
  title: string;
  description: string;
  tag: "Wallet Service" | "Category Service" | "Transaction Service" | "Hệ thống";
  time: string;
  status: "success" | "pending" | "info";
};

type TransactionTypeFilter = "all" | "expense" | "income";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const toInputDateTime = (value: Date) => {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatRelativeTime = (value: string) => {
  const target = new Date(value);
  const diffMinutes = Math.floor((Date.now() - target.getTime()) / 60000);

  if (diffMinutes <= 0) {
    return "Vừa xong";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(target);
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const walletColorPool = [
  "from-sky-500 to-blue-600",
  "from-violet-500 to-indigo-600",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-orange-500",
  "from-cyan-500 to-slate-500",
  "from-lime-500 to-emerald-500",
];

const ShieldCheckIcon: IconComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    {...props}
  >
    <path d="M12 3 4.5 6v5.25c0 4.26 2.85 8.19 7.05 9.5h.9c4.2-1.31 7.05-5.24 7.05-9.5V6L12 3Z" />
    <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const categories: Category[] = [
  {
    id: "cat-sinhhoat",
    name: "Sinh hoạt",
    type: "expense",
    icon: HomeIcon,
    children: [
      { id: "cat-sinhhoat-dien", name: "Tiền điện", icon: BoltIcon },
      { id: "cat-sinhhoat-nuoc", name: "Tiền nước", icon: SparklesIcon },
      { id: "cat-sinhhoat-internet", name: "Internet & TV", icon: SparklesIcon },
    ],
  },
  {
    id: "cat-anuong",
    name: "Ăn uống",
    type: "expense",
    icon: ShoppingBagIcon,
    children: [
      { id: "cat-anuong-sieuthi", name: "Siêu thị", icon: ShoppingBagIcon },
      { id: "cat-anuong-tiec", name: "Ăn ngoài", icon: SparklesIcon },
      { id: "cat-anuong-ca-phe", name: "Cà phê & Trà", icon: SparklesIcon },
    ],
  },
  {
    id: "cat-suckhoe",
    name: "Sức khỏe",
    type: "expense",
    icon: HeartIcon,
    children: [
      { id: "cat-suckhoe-thuoc", name: "Thuốc men", icon: HeartIcon },
      { id: "cat-suckhoe-bao-hiem", name: "Bảo hiểm", icon: ShieldCheckIcon },
    ],
  },
  {
    id: "cat-giaoduc",
    name: "Giáo dục",
    type: "expense",
    icon: AcademicCapIcon,
    children: [
      { id: "cat-giaoduc-khoa-hoc", name: "Khóa học", icon: AcademicCapIcon },
      { id: "cat-giaoduc-sach", name: "Sách vở", icon: SparklesIcon },
    ],
  },
  {
    id: "cat-lamviec",
    name: "Công việc",
    type: "expense",
    icon: BriefcaseIcon,
    children: [
      { id: "cat-lamviec-di-chuyen", name: "Di chuyển", icon: BriefcaseIcon },
      { id: "cat-lamviec-van-phong", name: "Văn phòng phẩm", icon: SparklesIcon },
    ],
  },
  {
    id: "cat-luong",
    name: "Lương thưởng",
    type: "income",
    icon: CurrencyDollarIcon,
    children: [
      { id: "cat-luong-co-dinh", name: "Lương cố định", icon: BanknotesIcon },
      { id: "cat-luong-thuong", name: "Thưởng dự án", icon: SparklesIcon },
    ],
  },
  {
    id: "cat-dautu",
    name: "Đầu tư",
    type: "income",
    icon: ChartPieIcon,
    children: [
      { id: "cat-dautu-co-tuc", name: "Cổ tức cổ phiếu", icon: ChartPieIcon },
      { id: "cat-dautu-lai", name: "Lãi tiết kiệm", icon: CurrencyDollarIcon },
    ],
  },
];

const initialWallets: Wallet[] = [
  {
    id: "wallet-cash",
    name: "Ví tiền mặt",
    balance: 1250000,
    type: "Tiền mặt",
    color: "from-amber-400 to-orange-500",
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "wallet-bidv",
    name: "Thẻ ghi nợ BIDV",
    balance: 8250000,
    type: "Ngân hàng",
    color: "from-sky-500 to-blue-600",
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "wallet-momo",
    name: "Ví Momo",
    balance: 2350000,
    type: "Ví điện tử",
    color: "from-rose-500 to-red-500",
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
];

const initialTransactions: Transaction[] = [
  {
    id: "tx-001",
    walletId: "wallet-bidv",
    amount: 420000,
    categoryId: "cat-sinhhoat",
    subCategoryId: "cat-sinhhoat-dien",
    type: "expense",
    date: "2024-06-18T08:15:00+07:00",
    description: "Thanh toán tiền điện tháng 5",
    location: '{"lat":10.762622,"lng":106.660172}',
  },
  {
    id: "tx-002",
    walletId: "wallet-momo",
    amount: 185000,
    categoryId: "cat-anuong",
    subCategoryId: "cat-anuong-ca-phe",
    type: "expense",
    date: "2024-06-17T14:40:00+07:00",
    description: "Cà phê cùng đối tác",
    location: '{"place":"Quận 1, TP.HCM"}',
  },
  {
    id: "tx-003",
    walletId: "wallet-bidv",
    amount: 24500000,
    categoryId: "cat-luong",
    subCategoryId: "cat-luong-co-dinh",
    type: "income",
    date: "2024-06-15T09:10:00+07:00",
    description: "Nhận lương tháng 6",
  },
  {
    id: "tx-004",
    walletId: "wallet-cash",
    amount: 95000,
    categoryId: "cat-anuong",
    subCategoryId: "cat-anuong-sieuthi",
    type: "expense",
    date: "2024-06-16T11:30:00+07:00",
    description: "Mua trái cây ở chợ",
  },
  {
    id: "tx-005",
    walletId: "wallet-momo",
    amount: 1250000,
    categoryId: "cat-dautu",
    subCategoryId: "cat-dautu-lai",
    type: "income",
    date: "2024-06-10T07:00:00+07:00",
    description: "Lãi suất tiết kiệm kỳ hạn 3 tháng",
  },
  {
    id: "tx-006",
    walletId: "wallet-bidv",
    amount: 320000,
    categoryId: "cat-suckhoe",
    subCategoryId: "cat-suckhoe-thuoc",
    type: "expense",
    date: "2024-06-12T18:20:00+07:00",
    description: "Mua thuốc tại Long Châu",
  },
];

const initialEvents: EventLog[] = [
  {
    id: "event-001",
    title: "transaction_added",
    description: "Ghi nhận chi tiêu tiền điện 420.000₫ thông qua dịch vụ Transaction",
    tag: "Transaction Service",
    time: "2024-06-18T08:15:12+07:00",
    status: "success",
  },
  {
    id: "event-002",
    title: "wallet_updated",
    description: "Cập nhật số dư ví Thẻ ghi nợ BIDV qua gRPC UpdateBalance",
    tag: "Wallet Service",
    time: "2024-06-18T08:15:12+07:00",
    status: "success",
  },
  {
    id: "event-003",
    title: "redis_cache_refresh",
    description: "Tải lại cache số dư ví từ Redis sau giao dịch",
    tag: "Hệ thống",
    time: "2024-06-18T08:16:00+07:00",
    status: "info",
  },
  {
    id: "event-004",
    title: "category_sync",
    description: "Đồng bộ danh mục chi tiêu/thu nhập từ dịch vụ Category",
    tag: "Category Service",
    time: "2024-06-17T21:00:00+07:00",
    status: "pending",
  },
];

const dateFilterOptions = [
  { id: "today", label: "Hôm nay" },
  { id: "7d", label: "7 ngày gần đây" },
  { id: "30d", label: "30 ngày" },
  { id: "all", label: "Toàn bộ" },
] as const;

type WalletFormState = {
  name: string;
  balance: string;
  type: WalletType;
};

export default function Home() {
  const [wallets, setWallets] = useState<Wallet[]>(initialWallets);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [events, setEvents] = useState<EventLog[]>(initialEvents);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("tat-ca");
  const [transactionView, setTransactionView] =
    useState<TransactionTypeFilter>("all");
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<(typeof dateFilterOptions)[number]["id"]>("7d");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState<boolean>(false);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState<boolean>(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    categories[0]?.id ?? "",
    categories.find((item) => item.type === "income")?.id ?? "",
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string>("overview");
  const [newTransaction, setNewTransaction] = useState({
    walletId: initialWallets[0]?.id ?? "",
    type: "expense" as "expense" | "income",
    amount: "",
    categoryId:
      categories.find((item) => item.type === "expense")?.id ?? "",
    subCategoryId:
      categories
        .find((item) => item.type === "expense")
        ?.children[0]?.id ?? "",
    date: toInputDateTime(new Date()),
    description: "",
    location: "",
  });
  const [walletForm, setWalletForm] = useState<WalletFormState>({
    name: "",
    balance: "",
    type: "Tiền mặt",
  });

  const walletMap = useMemo(
    () => new Map(wallets.map((wallet) => [wallet.id, wallet])),
    [wallets],
  );

  const parentCategoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => {
      map.set(cat.id, cat);
    });
    return map;
  }, []);

  const childCategoryMap = useMemo(() => {
    const map = new Map<
      string,
      CategoryChild & {
        parentId: string;
      }
    >();
    categories.forEach((cat) => {
      cat.children.forEach((child) => {
        map.set(child.id, { ...child, parentId: cat.id });
      });
    });
    return map;
  }, []);

  const isDateWithinFilter = (value: string, filterId: string) => {
    if (filterId === "all") {
      return true;
    }

    const target = new Date(value);
    const now = new Date();

    if (filterId === "today") {
      return (
        target.getFullYear() === now.getFullYear() &&
        target.getMonth() === now.getMonth() &&
        target.getDate() === now.getDate()
      );
    }

    const dayCount = filterId === "7d" ? 7 : 30;
    const diff = now.getTime() - target.getTime();
    return diff >= 0 && diff <= dayCount * 24 * 60 * 60 * 1000;
  };

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return transactions
      .filter((transaction) => {
        if (
          selectedWalletId !== "tat-ca" &&
          transaction.walletId !== selectedWalletId
        ) {
          return false;
        }

        if (transactionView !== "all" && transaction.type !== transactionView) {
          return false;
        }

        if (!isDateWithinFilter(transaction.date, selectedDateFilter)) {
          return false;
        }

        if (normalizedSearch) {
          const walletName =
            walletMap.get(transaction.walletId)?.name.toLowerCase() ?? "";
          const parentCategoryName =
            parentCategoryMap.get(transaction.categoryId)?.name.toLowerCase() ??
            "";
          const childCategoryName = transaction.subCategoryId
            ? childCategoryMap
                .get(transaction.subCategoryId)
                ?.name.toLowerCase() ?? ""
            : "";

          const haystack = `${transaction.description.toLowerCase()} ${walletName} ${parentCategoryName} ${childCategoryName}`;
          if (!haystack.includes(normalizedSearch)) {
            return false;
          }
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
  }, [
    transactions,
    selectedWalletId,
    selectedDateFilter,
    transactionView,
    searchTerm,
    walletMap,
    parentCategoryMap,
    childCategoryMap,
  ]);

  const computedStats = useMemo(() => {
    const now = new Date();

    const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0);

    const withinDays = (transaction: Transaction, days: number) => {
      const diff = now.getTime() - new Date(transaction.date).getTime();
      return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
    };

    const weeklyTransactions = transactions.filter((transaction) =>
      withinDays(transaction, 7),
    );

    const weeklyExpense = weeklyTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    const weeklyIncome = weeklyTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    const monthTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.date);
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    });

    const monthExpense = monthTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    return {
      totalBalance,
      weeklyExpense,
      weeklyIncome,
      monthExpense,
    };
  }, [wallets, transactions]);

  const availableCategories = useMemo(
    () => categories.filter((item) => item.type === newTransaction.type),
    [newTransaction.type],
  );

  const selectedCategory = availableCategories.find(
    (item) => item.id === newTransaction.categoryId,
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((item) => item !== categoryId)
        : [...prev, categoryId],
    );
  };

  const setToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const resetTransactionForm = () => {
    const defaultCategory = categories.find(
      (item) => item.type === "expense",
    );

    setNewTransaction({
      walletId: newTransaction.walletId,
      type: "expense",
      amount: "",
      categoryId: defaultCategory?.id ?? "",
      subCategoryId: defaultCategory?.children[0]?.id ?? "",
      date: toInputDateTime(new Date()),
      description: "",
      location: "",
    });
  };

  const handleAddTransaction = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTransactionError(null);

    const numericAmount = Number(newTransaction.amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setTransactionError("Vui lòng nhập số tiền hợp lệ lớn hơn 0");
      return;
    }

    if (!newTransaction.description.trim()) {
      setTransactionError("Ghi chú giao dịch không được để trống");
      return;
    }

    if (!newTransaction.walletId) {
      setTransactionError("Vui lòng chọn ví thực hiện giao dịch");
      return;
    }

    if (!newTransaction.categoryId) {
      setTransactionError("Danh mục không hợp lệ");
      return;
    }

    if (newTransaction.location) {
      try {
        JSON.parse(newTransaction.location);
      } catch {
        setTransactionError(
          "Địa điểm phải là JSON hợp lệ (ví dụ: {\"lat\":10.76})",
        );
        return;
      }
    }

    const targetWallet = walletMap.get(newTransaction.walletId);
    if (!targetWallet) {
      setTransactionError("Không tìm thấy ví đã chọn");
      return;
    }

    const isoDate = new Date(newTransaction.date).toISOString();
    const newRecord: Transaction = {
      id: `tx-${Date.now()}`,
      walletId: newTransaction.walletId,
      amount: numericAmount,
      categoryId: newTransaction.categoryId,
      subCategoryId: newTransaction.subCategoryId,
      type: newTransaction.type,
      date: isoDate,
      description: newTransaction.description.trim(),
      location: newTransaction.location.trim() || undefined,
    };

    setTransactions((prev) => [newRecord, ...prev]);
    setWallets((prev) =>
      prev.map((wallet) => {
        if (wallet.id !== newTransaction.walletId) {
          return wallet;
        }

        const balanceDelta =
          newTransaction.type === "expense" ? -numericAmount : numericAmount;

        return {
          ...wallet,
          balance: wallet.balance + balanceDelta,
          lastSyncedAt: isoDate,
        };
      }),
    );

    const parentCat = parentCategoryMap.get(newRecord.categoryId);
    const childCat = newRecord.subCategoryId
      ? childCategoryMap.get(newRecord.subCategoryId)
      : null;
    const walletName = walletMap.get(newRecord.walletId)?.name ?? "Ví";

    const transactionEvent: EventLog = {
      id: `event-${Date.now()}-tx`,
      title: "transaction_added",
      description: `${newRecord.type === "expense" ? "Chi" : "Thu"} ${
        formatCurrency(newRecord.amount)
      } • ${walletName} • ${parentCat?.name ?? "Danh mục"}${
        childCat ? ` › ${childCat.name}` : ""
      }`,
      tag: "Transaction Service",
      time: isoDate,
      status: "success",
    };

    const walletEvent: EventLog = {
      id: `event-${Date.now()}-wallet`,
      title: "wallet_updated",
      description: `Cập nhật số dư ${walletName} qua gRPC UpdateBalance`,
      tag: "Wallet Service",
      time: isoDate,
      status: "success",
    };

    const auditTrailEvent: EventLog = {
      id: `event-${Date.now()}-audit`,
      title: "audit_log_inserted",
      description: "Lưu vết giao dịch vào bảng Audit Log",
      tag: "Hệ thống",
      time: isoDate,
      status: "info",
    };

    setEvents((prev) =>
      [transactionEvent, walletEvent, auditTrailEvent, ...prev].slice(0, 12),
    );

    setToast("Đã ghi nhận giao dịch mới và đồng bộ số dư");
    setIsAddTransactionOpen(false);
    resetTransactionForm();
  };

  const handleCreateWallet = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWalletError(null);

    if (!walletForm.name.trim()) {
      setWalletError("Tên ví không được bỏ trống");
      return;
    }

    if (!walletForm.balance.trim()) {
      setWalletError("Vui lòng nhập số dư ban đầu (0 nếu chưa có)");
      return;
    }

    const numericBalance = Number(walletForm.balance.replace(/\s+/g, ""));
    if (Number.isNaN(numericBalance) || numericBalance < 0) {
      setWalletError("Số dư ban đầu phải là số hợp lệ");
      return;
    }

    const newWallet: Wallet = {
      id: `wallet-${Date.now()}`,
      name: walletForm.name.trim(),
      type: walletForm.type,
      balance: numericBalance,
      color: walletColorPool[wallets.length % walletColorPool.length],
      lastSyncedAt: new Date().toISOString(),
    };

    setWallets((prev) => [newWallet, ...prev]);
    setSelectedWalletId(newWallet.id);

    const creationEvent: EventLog = {
      id: `event-${Date.now()}-wallet-create`,
      title: "wallet_created",
      description: `Tạo ví ${newWallet.name} với số dư ${formatCurrency(
        numericBalance,
      )}`,
      tag: "Wallet Service",
      time: new Date().toISOString(),
      status: "info",
    };

    setEvents((prev) => [creationEvent, ...prev].slice(0, 12));
    setToast("Đã tạo ví mới thành công");
    setIsAddWalletOpen(false);
    setWalletForm({
      name: "",
      balance: "",
      type: "Tiền mặt",
    });
  };

  const bottomNavItems = [
    { id: "overview", label: "Tổng quan", icon: HomeIcon },
    { id: "wallets", label: "Ví tiền", icon: WalletIcon },
    { id: "transactions", label: "Giao dịch", icon: ChartPieIcon },
    { id: "categories", label: "Danh mục", icon: AdjustmentsHorizontalIcon },
  ];

  const handleNavigation = (sectionId: string) => {
    setActiveNav(sectionId);
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const serviceHighlights = [
    {
      title: "Wallet Service",
      subtitle: "gRPC UpdateBalance",
      description: "Đồng bộ nhanh với Redis cache, đảm bảo số dư chính xác.",
    },
    {
      title: "Category Service",
      subtitle: "Phân cấp danh mục",
      description: "Đồng bộ parent/child, hỗ trợ icon và phân loại tiêu dùng.",
    },
    {
      title: "Transaction Service",
      subtitle: "Sự kiện transaction_added",
      description: "Ghi log audit và phát sự kiện realtime cho ví liên quan.",
    },
  ];

  const statusStyles: Record<
    EventLog["status"],
    { badge: string; dot: string }
  > = {
    success: {
      badge:
        "border border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
      dot: "bg-emerald-400",
    },
    pending: {
      badge: "border border-amber-400/40 bg-amber-400/15 text-amber-100",
      dot: "bg-amber-400",
    },
    info: {
      badge: "border border-sky-400/40 bg-sky-400/15 text-sky-100",
      dot: "bg-sky-400",
    },
  };

  return (
    <div className="min-h-screen bg-transparent text-white">
      {toastMessage ? (
        <div className="fixed left-1/2 top-6 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-full bg-emerald-500/90 px-5 py-3 text-center text-sm font-medium text-emerald-950 shadow-2xl shadow-emerald-500/40">
          {toastMessage}
        </div>
      ) : null}

      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-4 pb-28 pt-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            className="rounded-full bg-white/5 p-2 text-slate-200"
            aria-label="Mở menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
              Quản lý tài chính
            </p>
            <h1 className="mt-1 text-xl font-semibold">Ví Cá Nhân</h1>
          </div>
          <button
            type="button"
            className="rounded-full bg-emerald-500/10 p-2 text-emerald-200"
            aria-label="Thông báo"
          >
            <BellAlertIcon className="h-6 w-6" />
          </button>
        </header>

        <section
          id="overview"
          className="rounded-3xl bg-gradient-to-br from-emerald-500 via-sky-500 to-indigo-500 p-5 shadow-[0_25px_45px_-20px_rgba(56,189,248,0.45)]"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">
                Tổng tài sản
              </p>
              <p className="mt-3 text-3xl font-semibold">
                {formatCurrency(computedStats.totalBalance)}
              </p>
            </div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/80">
              Đồng bộ realtime
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/90">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-white/70">Chi ra 7 ngày</p>
              <p className="mt-1 text-lg font-semibold text-rose-100">
                -{formatCurrency(computedStats.weeklyExpense)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-white/70">Thu vào 7 ngày</p>
              <p className="mt-1 text-lg font-semibold text-emerald-100">
                +{formatCurrency(computedStats.weeklyIncome)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-white/70">Chi tháng này</p>
              <p className="mt-1 text-lg font-semibold">
                {formatCurrency(computedStats.monthExpense)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-white/70">Ví đang kết nối</p>
              <p className="mt-1 text-lg font-semibold">{wallets.length} ví</p>
            </div>
          </div>
        </section>

        <section id="wallets" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Ví thanh toán</h2>
              <p className="text-xs text-slate-400">
                Đồng bộ tức thời qua dịch vụ Wallet
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddWalletOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90"
            >
              <PlusIcon className="h-4 w-4" />
              Thêm ví
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedWalletId("tat-ca")}
              className={`min-w-[200px] shrink-0 rounded-3xl bg-slate-900/40 p-4 text-left transition-all ${selectedWalletId === "tat-ca" ? "ring-2 ring-emerald-400/80" : "ring-1 ring-white/5"}`}
            >
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Tổng hợp</span>
                <ChevronRightIcon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {formatCurrency(computedStats.totalBalance)}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {wallets.length} ví • Đồng bộ Redis
              </p>
            </button>

            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                onClick={() => setSelectedWalletId(wallet.id)}
                className={`min-w-[200px] shrink-0 rounded-3xl p-[1px] transition-all ${
                  selectedWalletId === wallet.id
                    ? "ring-2 ring-emerald-400/70"
                    : "ring-1 ring-white/10"
                }`}
              >
                <div
                  className={`rounded-[22px] bg-gradient-to-br ${wallet.color} p-4 text-left`}
                >
                  <div className="flex items-center justify-between text-xs uppercase text-white/70">
                    <span>{wallet.type}</span>
                    <span className="rounded-full bg-black/15 px-2 py-0.5">
                      {formatRelativeTime(wallet.lastSyncedAt)}
                    </span>
                  </div>
                  <p className="mt-3 text-lg font-semibold">{wallet.name}</p>
                  <p className="mt-6 text-2xl font-semibold">
                    {formatCurrency(wallet.balance)}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {isAddWalletOpen ? (
            <form
              onSubmit={handleCreateWallet}
              className="space-y-3 rounded-3xl bg-slate-900/70 p-4 text-sm text-white/90"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Tạo ví mới</h3>
                <span className="text-xs text-slate-400">
                  Lưu trữ tại Wallet Service
                </span>
              </div>
              <label className="space-y-1">
                <span className="text-xs text-slate-300">Tên ví</span>
                <input
                  value={walletForm.name}
                  onChange={(event) =>
                    setWalletForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ví tiết kiệm, tài khoản lương..."
                  className="w-full rounded-2xl bg-slate-800/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-300">Số dư ban đầu</span>
                <input
                  value={walletForm.balance}
                  onChange={(event) =>
                    setWalletForm((prev) => ({
                      ...prev,
                      balance: event.target.value,
                    }))
                  }
                  placeholder="Ví dụ: 2500000"
                  inputMode="numeric"
                  className="w-full rounded-2xl bg-slate-800/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-300">Loại ví</span>
                <select
                  value={walletForm.type}
                  onChange={(event) =>
                    setWalletForm((prev) => ({
                      ...prev,
                      type: event.target.value as WalletType,
                    }))
                  }
                  className="w-full rounded-2xl bg-slate-800/70 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                >
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Ngân hàng">Ngân hàng</option>
                  <option value="Ví điện tử">Ví điện tử</option>
                  <option value="Đầu tư">Đầu tư</option>
                </select>
              </label>
              {walletError ? (
                <p className="text-xs text-rose-300">{walletError}</p>
              ) : null}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
              >
                <PlusIcon className="h-4 w-4" />
                Lưu ví mới
              </button>
            </form>
          ) : null}
        </section>

        <section
          id="services"
          className="grid gap-3 rounded-3xl bg-slate-900/60 p-4 text-sm text-slate-200"
        >
          <h2 className="text-base font-semibold text-white">
            Hạ tầng dịch vụ
          </h2>
          {serviceHighlights.map((service) => (
            <article
              key={service.title}
              className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/5"
            >
              <p className="text-xs uppercase tracking-widest text-emerald-200">
                {service.title}
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {service.subtitle}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {service.description}
              </p>
            </article>
          ))}
        </section>

        <section
          id="transactions"
          className="space-y-4 rounded-3xl bg-slate-900/65 p-4 text-sm text-white/90"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Lịch sử giao dịch</h2>
            <button
              type="button"
              onClick={() => setIsAddTransactionOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200"
            >
              <PlusIcon className="h-4 w-4" />
              Ghi giao dịch
            </button>
          </div>

          <div className="flex gap-2">
            {(
              [
                { id: "all", label: "Tất cả" },
                { id: "expense", label: "Chi tiêu" },
                { id: "income", label: "Thu nhập" },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTransactionView(option.id)}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold ${
                  transactionView === option.id
                    ? "bg-emerald-500 text-emerald-950"
                    : "bg-slate-800/80 text-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {dateFilterOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedDateFilter(option.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedDateFilter === option.id
                    ? "bg-white text-slate-900"
                    : "bg-slate-800/80 text-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 rounded-2xl bg-slate-800/70 px-3 py-2 text-xs text-slate-300">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm mô tả, ví hoặc danh mục..."
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </label>

          {isAddTransactionOpen ? (
            <form
              onSubmit={handleAddTransaction}
              className="space-y-3 rounded-3xl bg-slate-900/80 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">Ghi nhận giao dịch</p>
                  <p className="text-xs text-slate-400">
                    Transaction Service → UpdateBalance
                  </p>
                </div>
                <CalendarIcon className="h-5 w-5 text-slate-500" />
              </div>

              <label className="space-y-1">
                <span className="text-xs text-slate-300">Ví sử dụng</span>
                <select
                  value={newTransaction.walletId}
                  onChange={(event) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      walletId: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl bg-slate-800/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                >
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "expense", label: "Chi tiêu" },
                    { id: "income", label: "Thu nhập" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      const defaultCategory = categories.find(
                        (item) => item.type === option.id,
                      );
                      setNewTransaction((prev) => ({
                        ...prev,
                        type: option.id,
                        categoryId: defaultCategory?.id ?? "",
                        subCategoryId: defaultCategory?.children[0]?.id ?? "",
                      }));
                    }}
                    className={`rounded-2xl px-3 py-2 text-xs font-semibold ${
                      newTransaction.type === option.id
                        ? "bg-emerald-500 text-emerald-950"
                        : "bg-slate-800/80 text-slate-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <label className="space-y-1">
                <span className="text-xs text-slate-300">Số tiền (VND)</span>
                <input
                  value={newTransaction.amount}
                  onChange={(event) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      amount: event.target.value,
                    }))
                  }
                  inputMode="numeric"
                  placeholder="Ví dụ: 350000"
                  className="w-full rounded-2xl bg-slate-800/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs text-slate-300">Danh mục chính</span>
                <select
                  value={newTransaction.categoryId}
                  onChange={(event) => {
                    const categoryId = event.target.value;
                    const nextCategory =
                      availableCategories.find(
                        (item) => item.id === categoryId,
                      ) ?? availableCategories[0];
                    setNewTransaction((prev) => ({
                      ...prev,
                      categoryId,
                      subCategoryId: nextCategory?.children[0]?.id ?? "",
                    }));
                  }}
                  className="w-full rounded-2xl bg-slate-800/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                >
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs text-slate-300">Danh mục con</span>
                <select
                  value={newTransaction.subCategoryId}
                  onChange={(event) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      subCategoryId: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl bg-slate-800/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                >
                  {selectedCategory?.children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs text-slate-300">Thời gian</span>
                <input
                  type="datetime-local"
                  value={newTransaction.date}
                  onChange={(event) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl bg-slate-800/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs text-slate-300">Ghi chú</span>
                <input
                  value={newTransaction.description}
                  onChange={(event) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Thanh toán hóa đơn điện"
                  className="w-full rounded-2xl bg-slate-800/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs text-slate-300">
                  Địa điểm (JSON - tuỳ chọn)
                </span>
                <textarea
                  value={newTransaction.location}
                  onChange={(event) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      location: event.target.value,
                    }))
                  }
                  rows={2}
                  placeholder='Ví dụ: {"lat":10.7626,"lng":106.6601}'
                  className="w-full rounded-2xl bg-slate-800/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </label>

              {transactionError ? (
                <p className="text-xs text-rose-400">{transactionError}</p>
              ) : null}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
              >
                <PlusIcon className="h-4 w-4" />
                Ghi nhận & phát sự kiện
              </button>
            </form>
          ) : null}

          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="rounded-3xl bg-slate-900/70 p-6 text-center text-sm text-slate-400">
                Không có giao dịch phù hợp điều kiện lọc.
              </div>
            ) : (
              filteredTransactions.map((transaction) => {
                const parentCat = parentCategoryMap.get(transaction.categoryId);
                const childCat = transaction.subCategoryId
                  ? childCategoryMap.get(transaction.subCategoryId)
                  : null;
                const wallet = walletMap.get(transaction.walletId);
                const Icon =
                  (childCat?.icon ??
                    parentCat?.icon ??
                    (transaction.type === "expense"
                      ? ArrowDownCircleIcon
                      : ArrowUpCircleIcon)) as IconComponent;

                return (
                  <article
                    key={transaction.id}
                    className="flex items-start gap-3 rounded-3xl bg-slate-900/70 p-3"
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        transaction.type === "expense"
                          ? "bg-rose-500/15 text-rose-300"
                          : "bg-emerald-500/15 text-emerald-200"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-slate-400">
                            {parentCat?.name}
                            {childCat ? ` • ${childCat.name}` : ""}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-semibold ${
                            transaction.type === "expense"
                              ? "text-rose-300"
                              : "text-emerald-300"
                          }`}
                        >
                          {transaction.type === "expense" ? "-" : "+"}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-wide text-slate-500">
                        <span className="rounded-full bg-slate-800/70 px-2 py-1 text-[10px] text-slate-300">
                          {wallet?.name}
                        </span>
                        <span>{formatDateTime(transaction.date)}</span>
                        {transaction.location ? (
                          <span className="inline-flex items-center gap-1 text-xs normal-case text-slate-400">
                            <MapPinIcon className="h-4 w-4" />
                            {transaction.location}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section
          id="categories"
          className="space-y-3 rounded-3xl bg-slate-900/60 p-4 text-sm text-white/90"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Danh mục</h2>
              <p className="text-xs text-slate-400">
                Phân cấp parent/child phục vụ lọc giao dịch
              </p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-slate-500" />
          </div>

          {categories.map((category) => {
            const CategoryIcon = category.icon;
            const expanded = expandedCategories.includes(category.id);

            return (
              <article
                key={category.id}
                className="rounded-3xl bg-slate-900/75 p-4 ring-1 ring-white/5"
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-800/80 p-2 text-slate-200">
                      <CategoryIcon className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">
                        {category.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {category.type === "expense" ? "Chi tiêu" : "Thu nhập"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      expanded ? "text-emerald-300" : "text-slate-500"
                    }`}
                  >
                    {expanded ? "Thu gọn" : `${category.children.length} danh mục con`}
                  </span>
                </button>

                {expanded ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {category.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <div
                          key={child.id}
                          className="flex items-center gap-2 rounded-2xl bg-slate-800/70 px-3 py-2"
                        >
                          <ChildIcon className="h-5 w-5 text-emerald-300" />
                          <div className="text-left text-xs text-slate-300">
                            <p className="font-semibold text-white">
                              {child.name}
                            </p>
                            <p>
                              {category.type === "expense"
                                ? "Theo dõi chi tiêu chi tiết"
                                : "Nguồn thu nhập"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>

        <section
          id="events"
          className="space-y-3 rounded-3xl bg-slate-900/60 p-4 text-sm text-white/90"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Luồng sự kiện</h2>
            <span className="text-xs text-slate-400">
              Gồm Redis cache & audit log
            </span>
          </div>
          <div className="space-y-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="flex gap-3 rounded-3xl bg-slate-900/75 p-3 ring-1 ring-white/5"
              >
                <div
                  className={`mt-1 h-2 w-2 rounded-full ${statusStyles[event.status].dot}`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">
                      {event.title}
                    </p>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[event.status].badge}`}
                    >
                      {event.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {event.description}
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-wider text-slate-500">
                    {formatRelativeTime(event.time)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[90%] max-w-md items-center justify-between rounded-3xl bg-slate-900/90 p-3 text-xs text-slate-300 shadow-[0_25px_45px_-20px_rgba(15,23,42,0.9)] backdrop-blur-md">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigation(item.id)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-1 transition ${
                isActive
                  ? "bg-emerald-500/20 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
