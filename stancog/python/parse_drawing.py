import csv
import json

in_file = r"C:\Users\tlin\projects\stanislaus\docs\python\Stanislaus Drawing - Drawing Comments.csv"
out_file = r"C:\Users\tlin\projects\stanislaus\docs\python\drawing_comments.json"

in_data = []

with open(in_file, "rb") as csv_file:
    reader = csv.reader(csv_file, delimiter=",")
    for r in reader:
        in_data.append(r)

headers = in_data[0]
del in_data[0]

out_json = {"type": "FeatureCollection",
            "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
            "features": []
            }

for d in in_data:
    current_json = json.loads(d[headers.index("Shape")])
    for h in headers[:len(headers) - 1]:
        current_json["properties"][h] = d[headers.index(h)]

    out_json["features"].append(current_json)

with open(out_file, "wb") as f:
    json.dump(out_json, f)
