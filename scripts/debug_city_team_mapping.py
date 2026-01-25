import csv, json, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CSV_PATH = os.path.join(ROOT, 'Draence_Distribution_by_City_Team.csv')
CITIES_JSON = os.path.join(ROOT, 'mongo_cities_drae_data.json')
TEAMS_JSON = os.path.join(ROOT, 'mongo_teams_drae_data.json')

def normalize(s):
    if s is None: return ''
    return ''.join(c for c in s.upper().strip() if c.isalnum() or c.isspace())

with open(CITIES_JSON, 'r', encoding='utf-8') as f:
    cities = json.load(f)
with open(TEAMS_JSON, 'r', encoding='utf-8') as f:
    teams = json.load(f)

city_names = set(normalize(c.get('city') or c.get('name')) for c in cities)
team_names = set(normalize(t.get('name')) for t in teams)

csv_cities = set()
csv_teams = set()
with open(CSV_PATH, newline='', encoding='utf-8') as f:
    r = csv.DictReader(f)
    for row in r:
        csv_cities.add(normalize(row.get('Cidade')))
        csv_teams.add(normalize(row.get('Time')))

print('Cities in JSON but not in CSV (normalized, sample up to 20):')
print(sorted(list(city_names - csv_cities))[:20])
print('\nCities in CSV but not in JSON (normalized, sample up to 20):')
print(sorted(list(csv_cities - city_names))[:20])
print('\nTeams in JSON but not in CSV (normalized, sample up to 20):')
print(sorted(list(team_names - csv_teams))[:20])
print('\nTeams in CSV but not in JSON (normalized, sample up to 20):')
print(sorted(list(csv_teams - team_names))[:20])
