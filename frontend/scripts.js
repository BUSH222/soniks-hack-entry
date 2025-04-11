document.addEventListener('DOMContentLoaded', () => {
    const observationsContainer = document.getElementById('observations');
    const loadingIndicator = document.getElementById('loading');
    const toggleBtn = document.getElementById('toggleViewBtn');
    const filterSelect = document.getElementById('filterSelect');
    var apiUrl = 'https://sonik.space/api/observations/?format=json';
    console.log('Initial apiUrl:', apiUrl);

    let allData = [];
    let allCards = [];

    fetch(apiUrl)
        .then(response => {
            // Extract the 'Link' header
            const linkHeader = response.headers.get('Link');
            if (linkHeader) {
                const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
                if (match) {
                    apiUrl = match[1]; // Update apiUrl to the next link
                    console.log('Updated apiUrl:', apiUrl);
                }
            }
            return response.json();
        })
        .then(data => {
            loadingIndicator.style.display = 'none';
            allData = data;
            updateDisplay();
            // renderChart(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            loadingIndicator.innerHTML = '<p class="text-danger">Не получается загрузить данные.</p>';
        });
    
    toggleBtn.addEventListener('click', () => {
        fetch(apiUrl)
            .then(response => {
                const linkHeader = response.headers.get('Link');
                console.log(response.headers);
                if (linkHeader) {
                    const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
                    if (match) {
                        apiUrl = match[1];
                        console.log('Updated apiUrl:', apiUrl);
                    }
                }
                return response.json();
            })
            .then(data => {
                loadingIndicator.style.display = 'none';
                allData = allData.concat(data);
                updateDisplay();
                // renderChart(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                loadingIndicator.innerHTML = '<p class="text-danger">Не получается загрузить данные.</p>';
            });
    });
    

    function createCard(obs) {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4 observation-card';

        const card = document.createElement('div');
        card.className = 'card shadow-sm h-100';
        card.style.cursor = obs.demodulated_path ? 'pointer' : 'default';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = `Станция: ${obs.station_name}`;

        const status = document.createElement('p');
        status.className = `card-text text-${obs.status === 'future' ? 'warning' : 'success'}`;
        status.textContent = `Статус: ${obs.status}`;

        const startDate = document.createElement('p');
        startDate.className = 'card-text';
        startDate.textContent = `Старт: ${new Date(obs.start).toLocaleString()}`;

        const frequency = document.createElement('p');
        frequency.className = 'card-text';
        frequency.textContent = `Частота: ${obs.observation_frequency ? (obs.observation_frequency / 1e6) + ' MHz' : 'N/A'}`;

        cardBody.append(title, status, startDate, frequency);

        if (obs.demodulated_path) {
            const imageLabel = document.createElement('p');
            imageLabel.className = 'text-info fw-bold';
            imageLabel.textContent = 'Есть изображение';
            cardBody.appendChild(imageLabel);

            card.addEventListener('click', () => {
                window.open(obs.demodulated_path, '_blank');
            });
        }

        card.appendChild(cardBody);
        col.appendChild(card);
        return col;
    }

    function updateDisplay() {
        observationsContainer.innerHTML = '';
        allCards = [];
    
        const selectedFilter = filterSelect.value;
        let filteredData = allData;
        console.log(allData.length);
        console.log(allCards.length)
        if (selectedFilter === 'with') {
            filteredData = allData.filter(obs => obs.demodulated_path);
        } else if (selectedFilter === 'without') {
            filteredData = allData.filter(obs => !obs.demodulated_path);
        }
    
        filteredData.forEach(obs => {
            const card = createCard(obs);
            allCards.push(card);
        });
    
        allCards.forEach(card => observationsContainer.appendChild(card));
    }

    filterSelect.addEventListener('change', updateDisplay);

    // function renderChart(data) {
    //     const plannedCount = data.filter(obs => obs.status === 'future').length;
    //     const completedCount = data.filter(obs => obs.status !== 'future').length;

    //     const ctx = document.getElementById('observationsChart').getContext('2d');
    //     new Chart(ctx, {
    //         type: 'bar',
    //         data: {
    //             labels: ['Планируются', 'Завершённые'],
    //             datasets: [{
    //                 label: 'Наблюдения',
    //                 data: [plannedCount, completedCount],
    //                 backgroundColor: ['rgba(255, 193, 7, 0.6)', 'rgba(40, 167, 69, 0.6)'],
    //                 borderColor: ['rgba(255, 193, 7, 1)', 'rgba(40, 167, 69, 1)'],
    //                 borderWidth: 1
    //             }]
    //         },
    //         options: {
    //             responsive: true,
    //             plugins: {
    //                 legend: {
    //                     display: true,
    //                     position: 'top'
    //                 }
    //             },
    //             scales: {
    //                 y: {
    //                     beginAtZero: true
    //                 }
    //             }
    //         }
    //     });
    // }
});

