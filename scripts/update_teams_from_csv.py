#!/usr/bin/env python3
"""
update_teams_from_csv.py

Lê 'Draence_Distribution_by_City_Team.csv' e os arquivos
'mongo_cities_drae_data.json' e 'mongo_teams_drae_data.json'.
Gera um novo JSON de times (mesmo formato de 'mongo_teams_drae_data.json')
com o array `fans` atualizado a partir do CSV e opcionalmente sobrescreve
'o arquivo original (faz backup antes).

Uso:
  python scripts/update_teams_from_csv.py [--apply]

--apply: grava o resultado sobre 'mongo_teams_drae_data.json' (faz backup)

"""
import argparse
import csv
import json
import os
import sys
from collections import defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CSV_PATH = os.path.join(ROOT, 'Draence_Distribution_by_City_Team.csv')
CITIES_JSON = os.path.join(ROOT, 'mongo_cities_drae_data.json')
TEAMS_JSON = os.path.join(ROOT, 'mongo_teams_drae_data.json')
OUT_JSON = os.path.join(ROOT, 'mongo_teams_drae_data_from_csv.json')
BACKUP_JSON = os.path.join(ROOT, 'mongo_teams_drae_data.json.bak')


def normalize_name(s):
    if s is None:
        return ''
    s = s.strip().upper()
    # keep letters, numbers and spaces (remove accents could be added if needed)
    return ''.join(c for c in s if c.isalnum() or c.isspace())


def build_city_map(cities):
    # Map normalized city name to id
    m = {}
    for c in cities:
        name = c.get('city') or c.get('name')
        if not name:
            continue
        m[normalize_name(name)] = c['_id']
    return m


def build_team_map(teams):
    # Map normalized team name to team object
    m = {}
    for t in teams:
        m[normalize_name(t.get('name'))] = t
    return m


def read_csv(path):
    rows = []
    with open(path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        # sanitize fieldnames (remove BOM, stray spaces)
        if reader.fieldnames:
            reader.fieldnames = [fn.strip().replace('\ufeff', '') for fn in reader.fieldnames]
        for r in reader:
            # sanitize keys too
            cleaned = { (k or '').strip().replace('\ufeff', ''): (v or '').strip() for k, v in r.items() }
            rows.append(cleaned)
    return rows


def main(apply=False):
    # load files
    with open(CITIES_JSON, 'r', encoding='utf-8') as f:
        cities = json.load(f)
    with open(TEAMS_JSON, 'r', encoding='utf-8') as f:
        teams = json.load(f)

    city_map = build_city_map(cities)
    team_map = build_team_map(teams)

    rows = read_csv(CSV_PATH)

    # accumulate fans per team per cityId
    team_city_fans = defaultdict(lambda: defaultdict(int))
    missing_cities = set()
    missing_teams = set()

    for r in rows:
        city = normalize_name(r.get('Cidade'))
        team = normalize_name(r.get('Time'))
        try:
            fans = int(r.get('Torcedores') or 0)
        except ValueError:
            fans = 0

        if city not in city_map:
            missing_cities.add(r.get('Cidade'))
            continue
        city_id = city_map[city]

        if team not in team_map:
            # register missing team name (we will create minimal entry later)
            missing_teams.add(r.get('Time'))

        team_city_fans[team][city_id] += fans

    # Report missing names
    if missing_cities:
        print('⚠️ Cidades não encontradas no JSON de cidades:')
        for c in sorted(missing_cities):
            print('  -', c)
        print('Verifique e corrija nomes divergentes se necessário.')

    # Prepare new teams list from existing teams, updating fans
    new_teams = []
    used_team_keys = set(team_city_fans.keys())

    # create a quick lookup for max _id for potential new teams
    max_id = max((t.get('_id', 0) for t in teams), default=0)

    # Keep track of teams that exist in team_map
    for name_key, team_obj in team_map.items():
        fans_by_city = team_city_fans.get(name_key, {})
        fans_array = []
        for city_id, num in sorted(fans_by_city.items(), key=lambda x: x[0]):
            if num > 0:
                fans_array.append({'fans': num, 'cityId': city_id})
        # create a copy of the team object and replace fans
        tcopy = dict(team_obj)
        tcopy['fans'] = fans_array
        new_teams.append(tcopy)
        if name_key in used_team_keys:
            used_team_keys.remove(name_key)

    # Add any teams present in CSV but missing from teams JSON (create minimal entries)
    for missing_team in sorted(used_team_keys):
        # find original team name from rows (case-sensitive) first occurrence
        orig_name = None
        for r in rows:
            if normalize_name(r.get('Time')) == missing_team:
                orig_name = r.get('Time')
                break
        max_id += 1
        fans_by_city = team_city_fans.get(missing_team, {})
        fans_array = [{'fans': num, 'cityId': cid} for cid, num in sorted(fans_by_city.items(), key=lambda x: x[0]) if num > 0]
        new_team = {
            '_id': max_id,
            'name': orig_name or missing_team,
            'imgUrl': '',
            'cityId': None,
            'currentSeries': '',
            'mascot': '',
            'stadium': '',
            'stadiumQuality': '',
            'stadiumCapacity': 0,
            'foundedYear': 0,
            'fans': fans_array
        }
        new_teams.append(new_team)
        print('✳️ Criado time novo (a partir do CSV):', new_team['name'], '(_id:', new_team['_id'], ')')

    # Save result
    with open(OUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(new_teams, f, indent=2, ensure_ascii=False)

    print('\n✅ Arquivo gerado:', OUT_JSON)

    if apply:
        # backup
        if not os.path.exists(BACKUP_JSON):
            os.rename(TEAMS_JSON, BACKUP_JSON)
            print('📦 Backup criado:', BACKUP_JSON)
        else:
            # overwrite original but keep backup
            os.remove(TEAMS_JSON)
            print('📦 Backup já existente (substituindo original).')
        # write new teams to original path
        with open(TEAMS_JSON, 'w', encoding='utf-8') as f:
            json.dump(new_teams, f, indent=2, ensure_ascii=False)
        print('🔧 Arquivo original atualizado:', TEAMS_JSON)


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--apply', action='store_true', help='Sobrescreve mongo_teams_drae_data.json (faz backup)')
    args = p.parse_args()
    main(apply=args.apply)
