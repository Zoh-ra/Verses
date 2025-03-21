import axios from 'axios';

// We'll use the Quran.com API for this project
const API_BASE_URL = 'https://api.quran.com/api/v4';

export interface Surah {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  surah_id: number;
  page_number: number;
  juz_number: number;
  hizb_number: number;
  rub_number: number;
  sajdah_type?: string;
}

export interface Translation {
  id: number;
  text: string;
  verse_id: number;
  language_name: string;
}

// Get all surahs (chapters)
export const getSurahs = async (): Promise<Surah[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chapters?language=fr`);
    return response.data.chapters;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    return [];
  }
};

// Get verses for a specific surah
export const getVersesBySurah = async (surahId: number): Promise<Verse[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/verses/by_chapter/${surahId}?language=fr&words=false&translations=31&fields=text_uthmani&page=1&per_page=300`
    );
    return response.data.verses;
  } catch (error) {
    console.error(`Error fetching verses for surah ${surahId}:`, error);
    return [];
  }
};

// Get verse by key (e.g., "1:1" for Al-Fatiha verse 1)
export const getVerseByKey = async (verseKey: string): Promise<Verse | null> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/verses/by_key/${verseKey}?language=fr&words=false&translations=31&fields=text_uthmani`
    );
    return response.data.verse;
  } catch (error) {
    console.error(`Error fetching verse ${verseKey}:`, error);
    return null;
  }
};

// Get translation for a specific verse
export const getTranslation = async (verseId: number, languageCode: string = 'fr'): Promise<Translation | null> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/translations/${verseId}?language=${languageCode}`
    );
    return response.data.translation;
  } catch (error) {
    console.error(`Error fetching translation for verse ${verseId}:`, error);
    return null;
  }
};
