import requests
from bs4 import BeautifulSoup

def crawl_stock_data(code: str, length: int = 10):
    base_url = f'https://finance.naver.com/item/sise_day.naver?code={code}&page='
    result_data = []
    for i in range(1, length + 1):
        result = requests.get(base_url + str(i), headers={"User-agent": "Mozilla/5.0"}).text
        soup = BeautifulSoup(result, "html.parser")

        trs = soup.find_all("tr")

        for tr in trs:
            trtxt = str(tr)
            if "gray03" not in trtxt:
                continue

            day = trtxt.split("03\">")[1].split("<")[0]
            p11 = trtxt.split("p11\">")
            price = p11[1].split("<")[0]
            if "보합" in trtxt:
                start = p11[3].split("<")[0]
                upper = p11[4].split("<")[0]
                lower = p11[5].split("<")[0]
            else:
                start = p11[2].split("<")[0]
                upper = p11[3].split("<")[0]
                lower = p11[4].split("<")[0]

            result_data.append({
                "ds": day,
                "y": int(price.replace(",", "")),
                "start": int(start.replace(",", "")),
                "upper": int(upper.replace(",", "")),
                "lower": int(lower.replace(",", ""))
            })

    result_data.reverse()
    return result_data

if __name__ == "__main__":
    print(crawl_stock_data("005930"))