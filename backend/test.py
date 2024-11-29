from backend.api.crawl_stock_data import crawl_stock_data
from backend.api.run_prophet import run_prophet

data = crawl_stock_data("005930", 10)
result = run_prophet(data)


print(len(data))
print(result[-1])