import requests
from bs4 import BeautifulSoup

base_url = "https://finance.naver.com/sise/entryJongmok.nhn?&page="

def crawl_kospi200():
    return_list = []
    for i in range(20):
        result = requests.get(base_url + str(i + 1)).text
        soup = BeautifulSoup(result, "html.parser")
        stocks = soup.find_all("td", class_="ctg")
        for stock in stocks:
            try:
                code = str(stock).split("code=")[1].split("\"")[0]
                name = str(stock).split("ent\">")[1].split("<")[0]
                return_list.append({
                    "code": code,
                    "name": name
                })
            except TypeError:
                continue
    return return_list

if __name__ == "__main__":
    print(crawl_kospi200())