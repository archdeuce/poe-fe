import './HeistPage.style.scss';
import {
  FetchGemDataParams,
  FetchGemTradeDataParams,
  FetchTradeDetailsDataParams,
  GemTradeData,
} from '@/types/api';
import {
  fetchHeistData as fetchGemData,
  fetchHeistTradeData as fetchGemTradeData,
  fetchTradeDetailsData,
} from '@/services/api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CURRENCY_MAP, LANGUAGES } from '@/utils/constants';
import DropZone from '@/components/DropZone';
import { GemDetailsData } from '@/types/ocr';
import Tesseract from 'tesseract.js';
import { useLoading } from '@/context/LoadingContext';
import PoeDynamicTooltip from '@/components/PoeDynamicTooltip';
const OcrTextLimit = 50;

const HeistPage = () => {
  const [isError, setIsError] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [gemName, setGemName] = useState<string>('');
  const [gemUrl, setGemUrl] = useState<string>('');
  const [gemDetailsUrl, setGemDetailsUrl] = useState<string>('');
  const [gemDetailsData, setGemDetailsData] = useState<GemDetailsData[]>([]);
  const [isNeedOpenUrl, setlsNeedOpenUrl] = useState<boolean>(false);
  const [isNeedPriceCheck, setlsNeedPriceCheck] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    LANGUAGES.RUS,
  );
  const gemTradeLinkRef = useRef<HTMLAnchorElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { setLoading } = useLoading();
  const resetState = useCallback(() => {
    setOcrText('');
    setGemName('');
    setGemUrl('');
    setGemDetailsUrl('');
    setGemDetailsData([]);
  }, []);

  const resetStatePartial = () => {
    setGemUrl('');
    setGemDetailsUrl('');
    setGemDetailsData([]);
  };

  const doOCR = useCallback(async () => {
    if (imageUrl) {
      setLoading(true);
      try {
        const {
          data: { text },
        } = await Tesseract.recognize(imageUrl, selectedLanguage, {
          logger: () => null,
        });
        let result = '';
        if (selectedLanguage === LANGUAGES.RUS) {
          result = text.replace(/[^а-яА-ЯёЁ\s\-]/g, '').trim();
        } else {
          result = text.replace(/[^a-zA-Z\s\-]/g, '').trim();
        }
        setOcrText(result);
      } catch (error) {
        console.error('OCR error:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [imageUrl, selectedLanguage, setLoading]);

  const getGemData = async (
    ocrText: FetchGemDataParams['ocrText'],
    language: FetchGemDataParams['language'],
  ) => {
    setLoading(true);
    try {
      const data = await fetchGemData({ ocrText, language });
      const { success, name } = data || {};
      if (success) {
        setIsError(false);
        setGemName(name || '');
      } else {
        setIsError(true);
        setGemName('Сервер не распознал название предмета.');
      }
    } catch (error) {
      console.error('Fetch gem data error:', error);
      setIsError(true);
      setGemName('Ошибка при запросе данных.');
    } finally {
      setLoading(false);
    }
  };

  const getGemTradeData = async (
    args: FetchGemTradeDataParams,
  ): Promise<GemTradeData | null> => {
    setLoading(true);
    try {
      const { name, language, levelMin, levelMax, quality, corrupted } = args;
      const data = await fetchGemTradeData({
        name,
        language,
        levelMin,
        levelMax,
        quality,
        corrupted,
      });
      const { success } = data || {};
      if (success) {
        setIsError(false);
        return data;
      } else {
        setIsError(true);
        return null;
      }
    } catch (error) {
      console.error('Fetch gem trade data error:', error);
      setIsError(true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processDefaultGem = (data: GemTradeData | null) => {
    if (!data) {
      setGemUrl(
        selectedLanguage === LANGUAGES.RUS
          ? 'https://ru.pathofexile.com/trade/'
          : 'https://www.pathofexile.com/trade/',
      );
      return;
    }
    const { url, detailsUrl } = data;
    setGemUrl(url || '');
    setGemDetailsUrl(detailsUrl || '');
  };

  const getTradeDetailsData = async (
    args: FetchTradeDetailsDataParams,
  ): Promise<GemDetailsData[] | null> => {
    setLoading(true);
    try {
      const data = await fetchTradeDetailsData(args);
      const { success, result } = data || { success: false, result: [] };
      if (success) {
        return result;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Fetch trade details error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedLanguage(localStorage.getItem('language') || LANGUAGES.RUS);
    setlsNeedOpenUrl(localStorage.getItem('openUrl') === 'true');
    setlsNeedPriceCheck(localStorage.getItem('checkPrice') === 'true');
  }, []);

  // Сканирование картинки если есть
  useEffect(() => {
    if (imageUrl) {
      doOCR();
    }
  }, [imageUrl, doOCR]);

  // Запрос на API для уточнения названия предмета
  useEffect(() => {
    if (ocrText?.trim().length) {
      resetStatePartial();
      setIsError(false);
      getGemData(ocrText, selectedLanguage);
    }
  }, [ocrText]);

  // Запрос ссылки через API когда известное название предмета
  useEffect(() => {
    if (gemName?.trim().length && !isError) {
      (async () => {
        const data = await getGemTradeData({
          name: gemName,
          language: selectedLanguage,
          levelMin: 1,
          levelMax: 19,
        });
        processDefaultGem(data);
      })();
    }
  }, [gemName]);

  // Получение данных для таблиц с ценами
  useEffect(() => {
    if (isNeedPriceCheck && !isError && gemDetailsUrl?.length) {
      // Проверка цен на камни 1+/0+
      (async () => {
        try {
          const data = await getTradeDetailsData({
            url: gemDetailsUrl,
          });
          if (Array.isArray(data)) {
            setGemDetailsData(data);
          }
        } catch (error) {
          console.log('Проверка цен на камни 1/0+ не удалась.');
        }
      })();

      // Проверка цен на камни 20/0+
      (async () => {
        try {
          const ulrData = await getGemTradeData({
            name: gemName,
            language: selectedLanguage,
            levelMin: 20,
            levelMax: 20,
            corrupted: false,
          });
          const { detailsUrl } = ulrData || {};
          if (!detailsUrl) {
            return;
          }
          const data = await getTradeDetailsData({
            url: detailsUrl,
          });
          if (Array.isArray(data)) {
            setGemDetailsData((prev) => [...prev, ...data]);
          }
        } catch (error) {
          console.log('Проверка цен на камни 20/0+ не удалась.');
        }
      })();

      // Проверка цен на камни 21/20+
      (async () => {
        try {
          const ulrData = await getGemTradeData({
            name: gemName,
            language: selectedLanguage,
            levelMin: 21,
            quality: 20,
            corrupted: true,
          });
          const { detailsUrl } = ulrData || {};
          if (!detailsUrl) {
            return;
          }
          const data = await getTradeDetailsData({
            url: detailsUrl,
          });
          if (Array.isArray(data)) {
            setGemDetailsData((prev) => [...prev, ...data]);
          }
        } catch (error) {
          console.log('Проверка цен на камни 21/20+ не удалась.');
        }
      })();
    }
    return () => {};
  }, [gemDetailsUrl, isNeedPriceCheck]);

  // Автоскролл вниз при появлении новых данных
  useEffect(() => {
    if (ocrText || gemName || gemDetailsData.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ocrText, gemName, gemDetailsData]);

  // Обработчик автооткрытия ссылок
  useEffect(() => {
    if (isNeedOpenUrl && gemUrl && gemTradeLinkRef.current) {
      setTimeout(() => {
        gemTradeLinkRef.current?.click();
      }, 500);
    }
  }, [gemUrl, gemTradeLinkRef]);

  const handleDrop = useCallback(
    (file: File) => {
      resetState();
      setImageUrl(URL.createObjectURL(file));
    },
    [resetState],
  );

  const renderScreenshot = () => (
    <section>
      <h1>Загрузка скриншота</h1>
      <DropZone onDrop={handleDrop} />
      {imageUrl && (
        <div className="image-preview">
          <img src={imageUrl} alt="Загруженный скриншот" />
        </div>
      )}
    </section>
  );

  const rendeOcrData = () => (
    <>
      {ocrText && (
        <section>
          <p className="text-output">
            <span>Распознанный текст:</span>
            {ocrText.length > OcrTextLimit
              ? ocrText.substring(0, OcrTextLimit).trim() + '...'
              : ocrText}
          </p>
        </section>
      )}
    </>
  );

  const rendeServerMainData = () => {
    const mainItem = gemDetailsData[0]?.item;
    return (
      <section>
        {gemName && (
          <p className="text-output">
            <span>Название предмета:</span>
            {mainItem ? (
              <PoeDynamicTooltip item={mainItem}>
                <span className="poe-tooltip-trigger">{gemName}</span>
              </PoeDynamicTooltip>
            ) : (
              gemName
            )}
          </p>
        )}
        {gemUrl && (
          <p className="text-output">
            <span>Ссылка на торговый сайт:</span>
            <a
              id="gem-trade-link"
              target="_blank"
              href={gemUrl}
              ref={gemTradeLinkRef}
            >
              {gemUrl}
            </a>
          </p>
        )}
      </section>
    );
  };

  const renderGemDataTable = (gemData: GemDetailsData[]) => (
    <table className="gem-price-table">
      <thead>
        <tr>
          <th>Уровень</th>
          <th>Качество</th>
          <th>Цена</th>
        </tr>
      </thead>
      <tbody>
        {gemData?.map(({ listing, item }) => {
          const gemLevel =
            item?.properties
              ?.find(({ name }) => name === 'Уровень' || name === 'Level')
              ?.values[0][0].substring(0, 2) || 1;
          const gemQuality =
            item?.properties?.find(
              ({ name }) => name === 'Качество' || name === 'Quality',
            )?.values[0][0] || 0;
          const { amount, currency } = listing?.price;
          const { indexed } = listing;
          return (
            <tr key={`gem-${indexed}`}>
              <td>
                <PoeDynamicTooltip item={item}>
                  <span className="poe-tooltip-trigger">{gemLevel}</span>
                </PoeDynamicTooltip>
              </td>
              <td>{gemQuality || 0}</td>
              <td>
                <div className="currency-container">
                  <span>{amount}</span>
                  <img
                    src={
                      CURRENCY_MAP[currency as keyof typeof CURRENCY_MAP] ||
                      CURRENCY_MAP.chaos
                    }
                    alt="Валюта"
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const rendePriceData = () => {
    return (
      <section>
        {isNeedPriceCheck &&
          gemDetailsData?.length > 0 &&
          renderGemDataTable(gemDetailsData)}
      </section>
    );
  };

  return (
    <>
      {renderScreenshot()}
      {rendeOcrData()}
      {rendeServerMainData()}
      {rendePriceData()}
      <div ref={bottomRef} />
    </>
  );
};
export default HeistPage;
