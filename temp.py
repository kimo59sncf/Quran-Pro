import requests
data = requests.get('https://www.mp3quran.net/api/v3/reciters').json()
for r in sorted(data['reciters'], key=lambda x: x['id'])[:50]:
    server = r['moshaf'][0]['server'] if r['moshaf'] else 'no'
    code = server.split('/')[3].replace('/', '') if server != 'no' else 'no'
    print(r['id'], repr(r['name']), code)
