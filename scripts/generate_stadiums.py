import json

def load_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)

def save_json(data, file_path):
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

def map_cities(cities_data):
    return {city['_id']: city['city'] for city in cities_data}

def map_teams(teams_data):
    teams = {}
    for team in teams_data:
        teams[team['_id']] = {
            'name': team['name'],
            'cityId': team['cityId'],
            'stadium': team['stadium'],
            'stadiumQuality': team['stadiumQuality'],
            'stadiumCapacity': team['stadiumCapacity']
        }
    return teams

def generate_stadiums(cities, teams):
    stadiums = []
    for team_id, team_info in teams.items():
        stadium = {
            '_id': len(stadiums) + 1,
            'name': team_info['stadium'],
            'quality': team_info['stadiumQuality'],
            'capacity': team_info['stadiumCapacity'],
            'owner': team_id,
            'city': team_info['cityId']
        }
        stadiums.append(stadium)
    return stadiums

def main():
    cities_file = '../data/mongo_cities_drae_data.json'
    teams_file = '../data/mongo_teams_drae_data.json'
    output_file = '../data/mongo_stadiuns_drae_data.json'

    cities_data = load_json(cities_file)
    teams_data = load_json(teams_file)

    cities = map_cities(cities_data)
    teams = map_teams(teams_data)

    stadiums = generate_stadiums(cities, teams)
    save_json(stadiums, output_file)

if __name__ == '__main__':
    main()