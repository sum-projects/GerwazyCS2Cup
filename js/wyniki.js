document.addEventListener('DOMContentLoaded', () => {
    const matches = JSON.parse(json).matches;
    const playerStats = {};

    // Przetwarzanie danych meczów
    matches.forEach(match => {
        match.players.forEach(player => {
            if (!playerStats[player.name]) {
                playerStats[player.name] = {
                    wins: 0,
                    totalDamage: 0,
                    matchesPlayed: 0
                };
            }

            playerStats[player.name].matchesPlayed++;
            playerStats[player.name].totalDamage += player.damage;
            if (player.win) {
                playerStats[player.name].wins++;
            }
        });
    });

    // Generowanie klasyfikacji
    generateClassifications(playerStats);

    // Generowanie statystyk graczy
    generatePlayerStats(playerStats);

    // Wczytywanie zrzutów ekranu
    loadScreenshots(matches);

    generateCharts(playerStats);

});

function generateClassifications(playerStats) {
    // Pierwszy Wygrany
    const pierwszyWygrany = Object.entries(playerStats)
        .sort((a, b) => b[1].wins - a[1].wins);
    populateTable('pierwszy-wygrany-table', ['Gracz', 'Liczba Wygranych'], pierwszyWygrany, stat => [stat[0], stat[1].wins]);

    // Najlepszy Grajek
    const najlepszyGrajek = Object.entries(playerStats)
        .filter(stat => stat[1].matchesPlayed >= 3)
        .sort((a, b) => (b[1].totalDamage / b[1].matchesPlayed) - (a[1].totalDamage / a[1].matchesPlayed));
    populateTable('najlepszy-grajek-table', ['Gracz', 'Średnie Obrażenia'], najlepszyGrajek, stat => [stat[0], (stat[1].totalDamage / stat[1].matchesPlayed).toFixed(2)]);

    // Honorowy Wojownik
    const honorowyWojownik = Object.entries(playerStats)
        .sort((a, b) => b[1].matchesPlayed - a[1].matchesPlayed);
    populateTable('honorowy-wojownik-table', ['Gracz', 'Liczba Meczów'], honorowyWojownik, stat => [stat[0], stat[1].matchesPlayed]);
}

function populateTable(tableId, headers, data, rowDataCallback) {
    const table = document.getElementById(tableId);
    table.innerHTML = '';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    const tbody = document.createElement('tbody');
    data.forEach(stat => {
        const row = document.createElement('tr');
        rowDataCallback(stat).forEach(text => {
            const td = document.createElement('td');
            td.textContent = text;
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
}

function generatePlayerStats(playerStats) {
    const container = document.getElementById('karty-graczy');
    container.innerHTML = '';

    Object.entries(playerStats).forEach(([name, stats]) => {
        const col = document.createElement('div');
        col.classList.add('col-md-4', 'mb-4');

        const card = document.createElement('div');
        card.classList.add('card', 'h-100', 'text-center');

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = name;

        const cardText = document.createElement('p');
        cardText.innerHTML = `
      Liczba Wygranych: ${stats.wins}<br>
      Liczba Meczów: ${stats.matchesPlayed}<br>
      Średnie Obrażenia: ${(stats.totalDamage / stats.matchesPlayed).toFixed(2)}
    `;

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);
        card.appendChild(cardBody);
        col.appendChild(card);
        container.appendChild(col);
    });
}

function loadScreenshots(matches) {
    const gallery = document.getElementById('galeria-zrzutow');
    gallery.innerHTML = '';

    matches.forEach(match => {
        const col = document.createElement('div');
        col.classList.add('col-md-4', 'mb-4');

        const link = document.createElement('a');
        link.href = `screenshots/${match.screenshot}`;
        link.setAttribute('data-lightbox', 'screenshots');
        link.setAttribute('data-title', `Mecz ${match.match_id} - ${match.date}`);

        const img = document.createElement('img');
        img.src = `screenshots/${match.screenshot}`;
        img.alt = `Mecz ${match.match_id}`;
        img.classList.add('img-fluid', 'rounded');

        link.appendChild(img);
        col.appendChild(link);
        gallery.appendChild(col);
    });
}

function generateCharts(playerStats) {
    // Dane do wykresów
    const labels = Object.keys(playerStats);
    const winsData = labels.map(name => playerStats[name].wins);
    const damageData = labels.map(name => (playerStats[name].totalDamage / playerStats[name].matchesPlayed).toFixed(2));

    // Wykres liczby wygranych
    const ctxWins = document.getElementById('wykres-wygranych').getContext('2d');
    const winsChart = new Chart(ctxWins, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Liczba Wygranych',
                data: winsData,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Liczba Wygranych przez Graczy'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    precision: 0
                }
            }
        }
    });

    // Wykres średnich obrażeń
    const ctxDamage = document.getElementById('wykres-obrazen').getContext('2d');
    const damageChart = new Chart(ctxDamage, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Średnie Obrażenia',
                data: damageData,
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Średnie Obrażenia przez Graczy'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


const json = `{
  "matches": [
    {
      "match_id": 1,
      "date": "2024-11-21",
      "players": [
        {"name": "LOKU", "kills": 32, "deaths": 24, "assists": 10, "psg": 56, "damage": 3790, "win": true},
        {"name": "Mixon2t", "kills": 22, "deaths": 24, "assists": 6, "psg": 59, "damage": 2498, "win": true},
        {"name": "Golden Sum", "kills": 21, "deaths": 20, "assists": 9, "psg": 38, "damage": 2442, "win": true},
        {"name": "pereK", "kills": 25, "deaths": 23, "assists": 6, "psg": 54, "damage": 2040, "win": true},
        {"name": "Kundi", "kills": 11, "deaths": 23, "assists": 6, "psg": 54, "damage": 1574, "win": true},
        {"name": "ncl.", "kills": 40, "deaths": 19, "assists": 4, "psg": 52, "damage": 3697, "win": false},
        {"name": "[-_-?]", "kills": 25, "deaths": 22, "assists": 6, "psg": 44, "damage": 2517, "win": false},
        {"name": "Pugiano ZDR", "kills": 20, "deaths": 24, "assists": 11, "psg": 40, "damage": 2284, "win": false},
        {"name": "KaLoSz CASE.GIFT", "kills": 17, "deaths": 24, "assists": 7, "psg": 29, "damage": 1845, "win": false},
        {"name": "GarbatyProPlayer", "kills": 12, "deaths": 23, "assists": 9, "psg": 25, "damage": 1737, "win": false}
      ],
      "screenshot": "mecz1.png"
    },
    {
      "match_id": 2,
      "date": "2024-11-21",
      "players": [
        {"name": "Golden Sum", "kills": 20, "deaths": 12, "assists": 6, "psg": 50, "damage": 2186, "win": true},
        {"name": "pereK", "kills": 21, "deaths": 11, "assists": 2, "psg": 28, "damage": 2088, "win": true},
        {"name": "HESOYAM", "kills": 19, "deaths": 12, "assists": 3, "psg": 47, "damage": 2028, "win": true},
        {"name": "Mixon2t", "kills": 10, "deaths": 13, "assists": 4, "psg": 40, "damage": 1171, "win": true},
        {"name": "Kundi", "kills": 6, "deaths": 19, "assists": 4, "psg": 66, "damage": 877, "win": true},
        {"name": "[-_-?]", "kills": 16, "deaths": 16, "assists": 8, "psg": 43, "damage": 1878, "win": false},
        {"name": "ncl.", "kills": 16, "deaths": 13, "assists": 4, "psg": 68, "damage": 1707, "win": false},
        {"name": "Dario", "kills": 13, "deaths": 17, "assists": 2, "psg": 30, "damage": 1425, "win": false},
        {"name": "GarbatyProPlayer", "kills": 10, "deaths": 14, "assists": 5, "psg": 30, "damage": 1188, "win": false},
        {"name": "KaLoSz CASE.GIFT", "kills": 11, "deaths": 16, "assists": 2, "psg": 27, "damage": 1080, "win": false}
      ],
      "screenshot": "mecz2.png"
    },
    {
      "match_id": 3,
      "date": "2024-11-21",
      "players": [
        {"name": "Golden Sum", "kills": 17, "deaths": 10, "assists": 5, "psg": 41, "damage": 2003, "win": true},
        {"name": "HESOYAM", "kills": 19, "deaths": 13, "assists": 4, "psg": 52, "damage": 1508, "win": true},
        {"name": "pereK", "kills": 11, "deaths": 9, "assists": 10, "psg": 18, "damage": 1308, "win": true},
        {"name": "Mixon2t", "kills": 12, "deaths": 9, "assists": 3, "psg": 58, "damage": 1208, "win": true},
        {"name": "Kundi", "kills": 9, "deaths": 11, "assists": 6, "psg": 33, "damage": 1015, "win": true},
        {"name": "ncl.", "kills": 17, "deaths": 13, "assists": 3, "psg": 23, "damage": 1987, "win": false},
        {"name": "KaLoSz CASE.GIFT", "kills": 10, "deaths": 14, "assists": 1, "psg": 30, "damage": 1072, "win": false},
        {"name": "Dario", "kills": 7, "deaths": 13, "assists": 4, "psg": 71, "damage": 1053, "win": false},
        {"name": "[-_-?]", "kills": 7, "deaths": 14, "assists": 2, "psg": 42, "damage": 658, "win": false},
        {"name": "GarbatyProPlayer", "kills": 2, "deaths": 14, "assists": 2, "psg": 0, "damage": 554, "win": false}
      ],
      "screenshot": "mecz3.png"
    },
    {
      "match_id": 4,
      "date": "2024-11-24",
      "players": [
        {"name": "HESOYAM", "kills": 27, "deaths": 7, "assists": 3, "psg": 37, "damage": 2549, "win": true},
        {"name": "Golden Sum", "kills": 16, "deaths": 11, "assists": 2, "psg": 12, "damage": 1904, "win": true},
        {"name": "Mixon2t", "kills": 17, "deaths": 11, "assists": 8, "psg": 41, "damage": 1836, "win": true},
        {"name": "pereK", "kills": 13, "deaths": 9, "assists": 2, "psg": 30, "damage": 1369, "win": true},
        {"name": "SebaPrzeCh", "kills": 7, "deaths": 13, "assists": 7, "psg": 14, "damage": 877, "win": true},
        {"name": "Stefanek", "kills": 18, "deaths": 15, "assists": 2, "psg": 33, "damage": 1973, "win": false},
        {"name": "ncl.", "kills": 15, "deaths": 15, "assists": 1, "psg": 66, "damage": 1537, "win": false},
        {"name": "KINIORSZCZYK", "kills": 6, "deaths": 17, "assists": 6, "psg": 83, "damage": 1128, "win": false},
        {"name": "AfterWait", "kills": 6, "deaths": 17, "assists": 2, "psg": 66, "damage": 836, "win": false},
        {"name": "GarbatyProPlayer", "kills": 6, "deaths": 17, "assists": 2, "psg": 33, "damage": 720, "win": false}
      ],
      "screenshot": "mecz4.png"
    },
    {
      "match_id": 5,
      "date": "2024-11-24",
      "players": [
        {"name": "HESOYAM", "kills": 31, "deaths": 15, "assists": 12, "psg": 35, "damage": 3099, "win": true},
        {"name": "Golden Sum", "kills": 21, "deaths": 18, "assists": 8, "psg": 52, "damage": 2204, "win": true},
        {"name": "GIBI JSP", "kills": 18, "deaths": 18, "assists": 7, "psg": 61, "damage": 1999, "win": true},
        {"name": "Stefanek", "kills": 15, "deaths": 14, "assists": 8, "psg": 50, "damage": 1804, "win": true},
        {"name": "GarbatyProPlayer", "kills": 13, "deaths": 16, "assists": 4, "psg": 38, "damage": 1167, "win": true},
        {"name": "ncl.", "kills": 25, "deaths": 17, "assists": 5, "psg": 40, "damage": 2547, "win": false},
        {"name": "KaLoSz CASE.GIFT", "kills": 15, "deaths": 21, "assists": 7, "psg": 33, "damage": 1902, "win": false},
        {"name": "BlaQu", "kills": 14, "deaths": 20, "assists": 5, "psg": 71, "damage": 1706, "win": false},
        {"name": "Kundi", "kills": 14, "deaths": 21, "assists": 10, "psg": 57, "damage": 1578, "win": false},
        {"name": "pereK", "kills": 13, "deaths": 19, "assists": 1, "psg": 7, "damage": 1175, "win": false}
      ],
      "screenshot": "mecz5.png"
    },
    {
      "match_id": 6,
      "date": "2024-11-25",
      "players": [
        {"name": "ncl.", "kills": 27, "deaths": 6, "assists": 4, "psg": 62, "damage": 2556, "win": true},
        {"name": "KaLoSz CASE.GIFT", "kills": 20, "deaths": 9, "assists": 5, "psg": 35, "damage": 2237, "win": true},
        {"name": "Stefanek", "kills": 12, "deaths": 13, "assists": 7, "psg": 50, "damage": 1431, "win": true},
        {"name": "GarbatyProPlayer", "kills": 5, "deaths": 14, "assists": 8, "psg": 40, "damage": 951, "win": true},
        {"name": "pereK", "kills": 13, "deaths": 11, "assists": 0, "psg": 61, "damage": 880, "win": true},
        {"name": "HESOYAM", "kills": 15, "deaths": 16, "assists": 7, "psg": 46, "damage": 2110, "win": false},
        {"name": "GIBI JSP", "kills": 11, "deaths": 15, "assists": 4, "psg": 72, "damage": 1426, "win": false},
        {"name": "Golden Sum", "kills": 10, "deaths": 16, "assists": 6, "psg": 50, "damage": 1210, "win": false},
        {"name": "BlaQu", "kills": 9, "deaths": 15, "assists": 3, "psg": 66, "damage": 908, "win": false},
        {"name": "Kundi", "kills": 7, "deaths": 15, "assists": 0, "psg": 14, "damage": 707, "win": false}
      ],
      "screenshot": "mecz6.png"
    }
  ]
}`;