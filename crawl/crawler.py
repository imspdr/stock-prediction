from crawl.api.run_prophet import run_prophet
from crawl.api.crawl_news import crawl_news
from crawl.api.crawl_stock_data import crawl_stock_data
from crawl.api.crawl_kospi200 import crawl_kospi200
import os
import json

if __name__ == "__main__":
    last_result = []
    kospi200 = crawl_kospi200()
    for stock in kospi200:
        data = crawl_stock_data(stock["code"], 20)
        result = run_prophet(data, 20)
        news = crawl_news(stock["name"])
        last_result.append({
            "code": stock["code"],
            "name": stock["name"],
            "given": data,
            "news": news,
            "result": result
        })


    filename = "data.json"

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    store_path = os.path.join(BASE_DIR, "../src/store/")

    with open(os.path.join(store_path, filename), "w", encoding="utf-8") as f:
        json.dump(last_result, f, ensure_ascii=False, indent=4)

