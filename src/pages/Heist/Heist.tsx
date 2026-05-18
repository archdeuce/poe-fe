import './Heist.style.scss';
import {
  fetchHeistData,
  fetchHeistTradeData,
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

const Heist = () => {
  const [isError, setIsError] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [heistName, setHeistName] = useState<string>('');
  const [heistUrl, setHeistUrl] = useState<string>('');
  const [heistDetailsUrl, setHeistDetailsUrl] = useState<string>('');
  const [heistDetailsData, setHeistDetailsData] = useState<GemDetailsData[]>(
    [],
  );
  const [isNeedOpenUrl, setlsNeedOpenUrl] = useState<boolean>(false);
  const [isNeedPriceCheck, setlsNeedPriceCheck] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    LANGUAGES.RUS,
  );
  const heistTradeLinkRef = useRef<HTMLAnchorElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { setLoading } = useLoading();
  const resetState = useCallback(() => {
    setOcrText('');
    setHeistName('');
    setHeistUrl('');
    setHeistDetailsUrl('');
    setHeistDetailsData([]);
  }, []);

  const resetStatePartial = () => {
    setHeistUrl('');
    setHeistDetailsUrl('');
    setHeistDetailsData([]);
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

  const getHeistData = async (ocrText: string, language: string) => {
    setLoading(true);
    try {
      const data = await fetchHeistData({ ocrText, language });
      const { success, name } = data || {};
      if (success) {
        setIsError(false);
        setHeistName(name || '');
      } else {
        setIsError(true);
        setHeistName('Сервер не распознал название предмета.');
      }
    } catch (error) {
      console.error('Fetch heist data error:', error);
      setIsError(true);
      setHeistName('Ошибка при запросе данных.');
    } finally {
      setLoading(false);
    }
  };

  const getHeistTradeData = async (
    name: string,
    language: string,
  ): Promise<any> => {
    setLoading(true);
    try {
      const data = await fetchHeistTradeData({
        name,
        language,
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
      console.error('Fetch heist trade data error:', error);
      setIsError(true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processDefaultHeist = (data: any) => {
    if (!data) {
      setHeistUrl(
        selectedLanguage === LANGUAGES.RUS
          ? 'https://ru.pathofexile.com/trade/'
          : 'https://www.pathofexile.com/trade/',
      );
      return;
    }
    const { url, detailsUrl } = data;
    setHeistUrl(url || '');
    setHeistDetailsUrl(detailsUrl || '');
  };

  const getTradeDetailsData = async (url: string): Promise<any[] | null> => {
    setLoading(true);
    try {
      const data = await fetchTradeDetailsData({ url });
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

  useEffect(() => {
    if (imageUrl) {
      doOCR();
    }
  }, [imageUrl, doOCR]);

  useEffect(() => {
    if (ocrText?.trim().length) {
      resetStatePartial();
      setIsError(false);
      getHeistData(ocrText, selectedLanguage);
    }
  }, [ocrText]);

  useEffect(() => {
    if (heistName?.trim().length && !isError) {
      (async () => {
        const data = await getHeistTradeData(heistName, selectedLanguage);
        processDefaultHeist(data);
      })();
    }
  }, [heistName]);

  useEffect(() => {
    if (isNeedPriceCheck && !isError && heistDetailsUrl?.length) {
      (async () => {
        try {
          const data = await getTradeDetailsData(heistDetailsUrl);
          if (Array.isArray(data)) {
            setHeistDetailsData(data);
          }
        } catch (error) {
          console.log('Проверка цен не удалась.');
        }
      })();
    }
  }, [heistDetailsUrl, isNeedPriceCheck]);

  useEffect(() => {
    if (ocrText || heistName || heistDetailsData.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ocrText, heistName, heistDetailsData]);

  useEffect(() => {
    if (isNeedOpenUrl && heistUrl && heistTradeLinkRef.current) {
      setTimeout(() => {
        heistTradeLinkRef.current?.click();
      }, 500);
    }
  }, [heistUrl, heistTradeLinkRef]);

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
    const mainItem = heistDetailsData[0]?.item;
    return (
      <section>
        {heistName && (
          <p className="text-output">
            <span>Название предмета:</span>
            {mainItem ? (
              <PoeDynamicTooltip item={mainItem}>
                <span className="poe-tooltip-trigger">{heistName}</span>
              </PoeDynamicTooltip>
            ) : (
              heistName
            )}
          </p>
        )}
        {heistUrl && (
          <p className="text-output">
            <span>Ссылка на торговый сайт:</span>
            <a
              id="heist-trade-link"
              target="_blank"
              href={heistUrl}
              ref={heistTradeLinkRef}
            >
              {heistUrl}
            </a>
          </p>
        )}
      </section>
    );
  };

  const renderDataTable = (heistData: any[]) => (
    <table className="heist-price-table">
      <thead>
        <tr>
          <th>Предмет</th>
          <th>Цена</th>
        </tr>
      </thead>
      <tbody>
        {heistData?.map(({ id, listing, item }) => {
          const { amount, currency } = listing?.price;
          return (
            <tr key={`heist-${id}`}>
              <td>
                <PoeDynamicTooltip item={item}>
                  <span className="poe-tooltip-trigger">{item.name}</span>
                </PoeDynamicTooltip>
              </td>
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
          heistDetailsData?.length > 0 &&
          renderDataTable(heistDetailsData)}
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
export default Heist;
