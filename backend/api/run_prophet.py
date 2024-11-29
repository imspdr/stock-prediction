import logging
import pandas as pd
from prophet import Prophet
from sympy.stats import given


def is_number(v):
    try:
        float(v)
        return True
    except (ValueError, TypeError):
        return False

def run_prophet(given_data, periods: int=100):
    model = Prophet()
    try:
        df = pd.DataFrame(given_data)
        given_length = len(given_data)
        model.fit(df)
        future = model.make_future_dataframe(periods=periods, include_history=True)
        forecast = model.predict(future)
        predictions = []
        for index, line in enumerate(forecast.iterrows()):
            newObject = {}
            newObject["predicted"] = 0 if index < given_length else 1
            for k, v in line[1].items():
                if not is_number(v):
                    v = str(v)
                newObject[k] = v
            predictions.append(newObject)
        return predictions

    except Exception as e:
        logging.info(f"prediction failed {e}")
        return []
