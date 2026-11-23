import { ref, computed } from 'vue';

// ── Types ─────────────────────────────────────────────────────────────
export interface PartnerProfile {
  id: 'partnerA' | 'partnerB';
  name: string;
  avatar: string;
  locationName: string;
  lat: number;
  lng: number;
  lastUpdated: string;
  isSharingLocation: boolean;
}

export interface DiaryNote {
  id: string;
  title: string;
  content: string;
  author: 'partnerA' | 'partnerB';
  authorName: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  paperColor: 'cream' | 'rose' | 'lavender' | 'mint' | 'amber';
}

export interface SpecialPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  date: string;
  author: 'partnerA' | 'partnerB';
  isFavorite: boolean;
}

export interface ImportantDate {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'anniversary' | 'birthday' | 'milestone' | 'custom';
}

export interface BucketItem {
  id: string;
  title: string;
  description: string;
  location?: string;
  status: 'planned' | 'in_progress' | 'completed';
  completedAt?: string;
}

export interface OurPlace {
  id: string;
  name: string;
  locationName: string;
  lat: number;
  lng: number;
  notes: string;
  visited: boolean;
  photoUrl?: string;
}

export interface DailyCheckin {
  id: string;
  date: string; // YYYY-MM-DD
  author: 'partnerA' | 'partnerB';
  authorName: string;
  mood: 'happy' | 'love' | 'calm' | 'tired' | 'excited';
  moodIcon: string;
  moodLabel: string;
  message: string;
  createdAt: string;
}

export interface RuangKitaData {
  spaceName: string;
  anniversaryDate: string;
  partnerA: PartnerProfile;
  partnerB: PartnerProfile;
  notes: DiaryNote[];
  photos: SpecialPhoto[];
  dates: ImportantDate[];
  bucketList: BucketItem[];
  places: OurPlace[];
  checkins: DailyCheckin[];
}

// ── Great-Circle Distance Calculation (Haversine Formula) ─────────────
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// ── Default Seed Data ─────────────────────────────────────────────────
const DEFAULT_DATA: RuangKitaData = {
  spaceName: 'Ruang Kita',
  anniversaryDate: '2024-02-14',
  partnerA: {
    id: 'partnerA',
    name: 'Aku',
    avatar: '',
    locationName: 'Bandung, Jawa Barat',
    lat: -6.9175,
    lng: 107.6191,
    lastUpdated: 'Hari ini, 18:30',
    isSharingLocation: true,
  },
  partnerB: {
    id: 'partnerB',
    name: 'Kamu',
    avatar: '',
    locationName: 'Jakarta Selatan, DKI Jakarta',
    lat: -6.2615,
    lng: 106.8106,
    lastUpdated: 'Hari ini, 19:15',
    isSharingLocation: true,
  },
  notes: [
    {
      id: 'note-1',
      title: 'Perjalanan Pertama Naik Kereta Cepat',
      content: 'Masih ingat waktu pertama kali naik Whoosh bareng ke Bandung? Gerbongnya tenang dan pemandangan bukit hijaunya bikin betah. Rasanya perjalanan singkat itu adalah salah satu sore paling berkesan.',
      author: 'partnerA',
      authorName: 'Aku',
      createdAt: '2026-10-15T14:20:00.000Z',
      updatedAt: '2026-10-15T14:20:00.000Z',
      isFavorite: true,
      paperColor: 'cream',
    },
    {
      id: 'note-2',
      title: 'Catatan Kecil untuk Harimu',
      content: 'Semoga harimu menyenangkan dan tidak terlalu melelahkan. Jangan lupa makan siang dan minum air putih yang cukup ya. Nanti sore kabari kalau sudah sampai rumah.',
      author: 'partnerB',
      authorName: 'Kamu',
      createdAt: '2026-11-02T08:10:00.000Z',
      updatedAt: '2026-11-02T08:10:00.000Z',
      isFavorite: true,
      paperColor: 'rose',
    },
  ],
  photos: [
    {
      id: 'photo-1',
      imageUrl: '/whoosh-icon.jpg',
      caption: 'Menikmati sore di Stasiun Padalarang',
      date: '15 Oktober 2026',
      author: 'partnerA',
      isFavorite: true,
    },
    {
      id: 'photo-2',
      imageUrl: '/whoosh-icon.jpg',
      caption: 'Secangkir kopi hangat saat menunggu senja',
      date: '28 Oktober 2026',
      author: 'partnerB',
      isFavorite: false,
    },
  ],
  dates: [
    {
      id: 'date-1',
      title: 'Hari Jadian Kita',
      date: '2024-02-14',
      description: 'Awal perjalanan kisah kita berdua di Bandung.',
      type: 'anniversary',
    },
    {
      id: 'date-2',
      title: 'Ulang Tahun Kamu',
      date: '2026-12-18',
      description: 'Hari spesial untuk orang yang paling berarti.',
      type: 'birthday',
    },
    {
      id: 'date-3',
      title: 'Trip Akhir Tahun',
      date: '2026-12-30',
      description: 'Menyambut pergantian tahun bersama.',
      type: 'milestone',
    },
  ],
  bucketList: [
    {
      id: 'bucket-1',
      title: 'Menjelajahi Kebun Teh Ciwidey berdua',
      description: 'Jalan santai pagi dan menikmati udara dingin pegunungan.',
      location: 'Ciwidey, Bandung',
      status: 'in_progress',
    },
    {
      id: 'bucket-2',
      title: 'Melihat Sunset di Tebing Karaton',
      description: 'Bawa kamera analog dan bikin foto Polaroid kenang-kenangan.',
      location: 'Bandung',
      status: 'planned',
    },
    {
      id: 'bucket-3',
      title: 'Wisata Kuliner Malam di Pasar Cihapit',
      description: 'Mencoba roti bakar legendaris dan wedang jahe hangat.',
      location: 'Bandung',
      status: 'completed',
      completedAt: '2026-10-18',
    },
  ],
  places: [
    {
      id: 'place-1',
      name: 'Stasiun Halim Whoosh',
      locationName: 'Jakarta Timur',
      lat: -6.2483,
      lng: 106.8863,
      notes: 'Tempat kita selalu bertemu setiap kali memulai perjalanan bareng.',
      visited: true,
    },
    {
      id: 'place-2',
      name: 'Taman Hutan Raya Juanda',
      locationName: 'Dago Pakar, Bandung',
      lat: -6.8576,
      lng: 107.6339,
      notes: 'Tempat impian untuk jalan pagi dan piknik santai di bawah pohon pinus.',
      visited: false,
    },
  ],
  checkins: [
    {
      id: 'chk-1',
      date: '2026-11-07',
      author: 'partnerA',
      authorName: 'Aku',
      mood: 'love',
      moodIcon: 'fa-face-grin-hearts',
      moodLabel: 'Penuh Kasih',
      message: 'Semangat ya buat hari ini! Menjelang akhir pekan rasanya rindu ingin cerita banyak.',
      createdAt: '08:30',
    },
    {
      id: 'chk-2',
      date: '2026-11-07',
      author: 'partnerB',
      authorName: 'Kamu',
      mood: 'happy',
      moodIcon: 'fa-face-smile',
      moodLabel: 'Bahagia',
      message: 'Pagi ini sejuk dan pekerjaan lancar. Semoga hari kita berdua berkah ya!',
      createdAt: '09:15',
    },
  ],
};

const STORAGE_KEY = 'whoosh_ruang_kita_data';

function loadStoredData(): RuangKitaData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_DATA, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load Ruang Kita storage:', e);
  }
  return DEFAULT_DATA;
}

const data = ref<RuangKitaData>(loadStoredData());

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value));
  } catch (e) {
    console.warn('Failed to persist Ruang Kita data:', e);
  }
}

// ── Composable ────────────────────────────────────────────────────────
export function useRuangKita() {
  const currentDistanceKm = computed(() => {
    return calculateDistanceKm(
      data.value.partnerA.lat,
      data.value.partnerA.lng,
      data.value.partnerB.lat,
      data.value.partnerB.lng
    );
  });

  function updatePartnerLocation(
    partner: 'partnerA' | 'partnerB',
    name: string,
    lat: number,
    lng: number
  ) {
    data.value[partner].locationName = name;
    data.value[partner].lat = lat;
    data.value[partner].lng = lng;
    data.value[partner].lastUpdated = 'Baru saja';
    persist();
  }

  function updatePartnerName(partner: 'partnerA' | 'partnerB', newName: string) {
    data.value[partner].name = newName;
    persist();
  }

  function addNote(note: Omit<DiaryNote, 'id' | 'createdAt' | 'updatedAt'>) {
    const newNote: DiaryNote = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.value.notes.unshift(newNote);
    persist();
    return newNote;
  }

  function deleteNote(id: string) {
    data.value.notes = data.value.notes.filter(n => n.id !== id);
    persist();
  }

  function toggleFavoriteNote(id: string) {
    const note = data.value.notes.find(n => n.id !== id);
    if (note) {
      note.isFavorite = !note.isFavorite;
      persist();
    }
  }

  function addBucketItem(item: Omit<BucketItem, 'id'>) {
    const newItem: BucketItem = {
      ...item,
      id: `bucket-${Date.now()}`,
    };
    data.value.bucketList.unshift(newItem);
    persist();
    return newItem;
  }

  function updateBucketStatus(id: string, status: BucketItem['status']) {
    const item = data.value.bucketList.find(b => b.id === id);
    if (item) {
      item.status = status;
      if (status === 'completed') {
        item.completedAt = new Date().toISOString().slice(0, 10);
      }
      persist();
    }
  }

  function deleteBucketItem(id: string) {
    data.value.bucketList = data.value.bucketList.filter(b => b.id !== id);
    persist();
  }

  function addCheckin(checkin: Omit<DailyCheckin, 'id' | 'createdAt' | 'date'>) {
    const newCheckin: DailyCheckin = {
      ...checkin,
      id: `chk-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    data.value.checkins.unshift(newCheckin);
    persist();
    return newCheckin;
  }

  function addImportantDate(item: Omit<ImportantDate, 'id'>) {
    const newDate: ImportantDate = {
      ...item,
      id: `date-${Date.now()}`,
    };
    data.value.dates.push(newDate);
    persist();
    return newDate;
  }

  function deleteImportantDate(id: string) {
    data.value.dates = data.value.dates.filter(d => d.id !== id);
    persist();
  }

  function addOurPlace(place: Omit<OurPlace, 'id'>) {
    const newPlace: OurPlace = {
      ...place,
      id: `place-${Date.now()}`,
    };
    data.value.places.unshift(newPlace);
    persist();
    return newPlace;
  }

  function toggleVisitedPlace(id: string) {
    const place = data.value.places.find(p => p.id === id);
    if (place) {
      place.visited = !place.visited;
      persist();
    }
  }

  return {
    data,
    currentDistanceKm,
    updatePartnerLocation,
    updatePartnerName,
    addNote,
    deleteNote,
    toggleFavoriteNote,
    addBucketItem,
    updateBucketStatus,
    deleteBucketItem,
    addCheckin,
    addImportantDate,
    deleteImportantDate,
    addOurPlace,
    toggleVisitedPlace,
  };
}

