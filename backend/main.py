from fastapi import FastAPI
from api.run_prophet import run_prophet
from api.crawl_news import crawl_news
from api.crawl_stock_data import crawl_stock_data
from api.crawl_kospi200 import crawl_kospi200
import pytz

kst = pytz.timezone('Asia/Seoul')

app = FastAPI()

@app.get("/stock/{code}/length/{length}/period/{period}")
def get_stock_data(code: str, length: int = 10, period: int = 100):
    data = crawl_stock_data(code, length)
    result = run_prophet(data, period)
    return {
        "given": data,
        "predicted": result
    }

@app.get("/kospi200")
def get_kospi_200():
    data = crawl_kospi200()
    return data

@app.get("/crawl_news/{keyword}")
def get_news(keyword: str):
    result = crawl_news(keyword)
    return result






