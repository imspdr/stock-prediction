import requests
from bs4 import BeautifulSoup


def crawl_news(search_name: str):

    base_url = "https://search.naver.com/search.naver?where=news&query="
    post_url = "&sm=tab_opt&sort=0&photo=3&field=0&pd=0&ds=&de=&docid=&related=0&mynews=0&office_type=0&office_section_code=0&news_office_checked=&nso=so%3Ar%2Cp%3Aall&is_sug_officeid=0&office_category=0&service_area=0"

    result = requests.get(base_url + search_name + post_url).text

    soup = BeautifulSoup(result, "html.parser")
    newss = soup.find_all("div", class_="news_contents")

    return_list = []
    for news in newss:
        try:
            title = str(news).split("title=\"")[1].split("\">")[0].replace("&quot;", "\'")
            news_link = str(news).split("href=\"")[1].split("\"")[0].replace("amp;", "")
            return_list.append({
                "title": title,
                "link": news_link
            })
        except (TypeError, IndexError):
            continue
    return return_list

if __name__ == "__main__":
    print(crawl_news("LG"))


