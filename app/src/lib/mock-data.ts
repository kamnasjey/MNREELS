export interface Video {
  id: string;
  title: string;
  episode: number;
  seriesTitle: string;
  creator: string;
  creatorAvatar: string;
  duration: string;
  likes: number;
  comments: number;
  isFree: boolean;
  tasalbar: number;
  gradient: string;
  category: string;
}

export interface Series {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  episodes: number;
  category: string;
  rating: number;
  views: string;
  gradient: string;
  freeEpisodes: number;
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  seriesCount: number;
  followers: string;
  gradient: string;
}

export const mockVideos: Video[] = [
  {
    id: "1",
    title: "Эхлэл",
    episode: 1,
    seriesTitle: "Хар шөнө",
    creator: "Б. Батболд",
    creatorAvatar: "ББ",
    duration: "4:32",
    likes: 2400,
    comments: 128,
    isFree: true,
    tasalbar: 0,
    gradient: "from-purple-900 via-indigo-900 to-black",
    category: "Уран сайхан",
  },
  {
    id: "2",
    title: "Нууц",
    episode: 2,
    seriesTitle: "Хар шөнө",
    creator: "Б. Батболд",
    creatorAvatar: "ББ",
    duration: "5:01",
    likes: 1800,
    comments: 95,
    isFree: true,
    tasalbar: 0,
    gradient: "from-slate-900 via-gray-800 to-black",
    category: "Уран сайхан",
  },
  {
    id: "3",
    title: "Мөрдлөг",
    episode: 3,
    seriesTitle: "Хар шөнө",
    creator: "Б. Батболд",
    creatorAvatar: "ББ",
    duration: "6:15",
    likes: 3200,
    comments: 210,
    isFree: false,
    tasalbar: 2,
    gradient: "from-red-950 via-rose-900 to-black",
    category: "Уран сайхан",
  },
  {
    id: "4",
    title: "Анхны алхам",
    episode: 1,
    seriesTitle: "Цагаан мөрөөдөл",
    creator: "О. Сарнай",
    creatorAvatar: "ОС",
    duration: "3:45",
    likes: 5600,
    comments: 340,
    isFree: true,
    tasalbar: 0,
    gradient: "from-cyan-900 via-teal-900 to-black",
    category: "Хайр дурлал",
  },
  {
    id: "5",
    title: "Хүлээлт",
    episode: 2,
    seriesTitle: "Цагаан мөрөөдөл",
    creator: "О. Сарнай",
    creatorAvatar: "ОС",
    duration: "4:20",
    likes: 4100,
    comments: 198,
    isFree: false,
    tasalbar: 2,
    gradient: "from-emerald-950 via-green-900 to-black",
    category: "Хайр дурлал",
  },
  {
    id: "6",
    title: "Сүүдэр",
    episode: 1,
    seriesTitle: "Харанхуй зам",
    creator: "Д. Тэмүүлэн",
    creatorAvatar: "ДТ",
    duration: "7:30",
    likes: 8900,
    comments: 567,
    isFree: true,
    tasalbar: 0,
    gradient: "from-amber-950 via-orange-900 to-black",
    category: "Аймшиг",
  },
];

export const mockSeries: Series[] = [
  {
    id: "1",
    title: "Хар шөнө",
    creator: "Б. Батболд",
    creatorAvatar: "ББ",
    episodes: 30,
    category: "Уран сайхан",
    rating: 4.8,
    views: "45K",
    gradient: "from-purple-800 to-indigo-900",
    freeEpisodes: 3,
  },
  {
    id: "2",
    title: "Цагаан мөрөөдөл",
    creator: "О. Сарнай",
    creatorAvatar: "ОС",
    episodes: 25,
    category: "Хайр дурлал",
    rating: 4.6,
    views: "32K",
    gradient: "from-cyan-800 to-teal-900",
    freeEpisodes: 3,
  },
  {
    id: "3",
    title: "Харанхуй зам",
    creator: "Д. Тэмүүлэн",
    creatorAvatar: "ДТ",
    episodes: 28,
    category: "Аймшиг",
    rating: 4.9,
    views: "67K",
    gradient: "from-red-800 to-rose-900",
    freeEpisodes: 2,
  },
  {
    id: "4",
    title: "Мөнгөн сар",
    creator: "Э. Номин",
    creatorAvatar: "ЭН",
    episodes: 20,
    category: "Инээдэм",
    rating: 4.3,
    views: "28K",
    gradient: "from-amber-800 to-yellow-900",
    freeEpisodes: 3,
  },
  {
    id: "5",
    title: "Зүрхний дуу",
    creator: "Г. Анар",
    creatorAvatar: "ГА",
    episodes: 26,
    category: "Хайр дурлал",
    rating: 4.7,
    views: "51K",
    gradient: "from-pink-800 to-fuchsia-900",
    freeEpisodes: 3,
  },
  {
    id: "6",
    title: "Тэнгэрийн хаалга",
    creator: "М. Бат-Эрдэнэ",
    creatorAvatar: "МБ",
    episodes: 30,
    category: "Адал явдал",
    rating: 4.5,
    views: "39K",
    gradient: "from-emerald-800 to-green-900",
    freeEpisodes: 2,
  },
];

export const mockCreators: Creator[] = [
  { id: "1", name: "Б. Батболд", avatar: "ББ", seriesCount: 8, followers: "12.5K", gradient: "from-purple-600 to-indigo-600" },
  { id: "2", name: "О. Сарнай", avatar: "ОС", seriesCount: 5, followers: "9.8K", gradient: "from-cyan-600 to-teal-600" },
  { id: "3", name: "Д. Тэмүүлэн", avatar: "ДТ", seriesCount: 12, followers: "25K", gradient: "from-red-600 to-rose-600" },
  { id: "4", name: "Э. Номин", avatar: "ЭН", seriesCount: 3, followers: "6.2K", gradient: "from-amber-600 to-yellow-600" },
  { id: "5", name: "Г. Анар", avatar: "ГА", seriesCount: 7, followers: "18K", gradient: "from-pink-600 to-fuchsia-600" },
];

export const categories = [
  "Бүгд",
  "Уран сайхан",
  "Хайр дурлал",
  "Инээдэм",
  "Аймшиг",
  "Адал явдал",
  "Гэмт хэрэг",
  "Түүхэн",
];

export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}
