document.addEventListener('DOMContentLoaded', () => {
    const observationsContainer = document.getElementById('observations');
    const loadingIndicator = document.getElementById('loading');
    const apiUrl = 'https://sonik.space/api/observations/';

    fetch(apiUrl, {
    })
        .then(response => response.json())
        .then(data => {
            loadingIndicator.style.display = 'none';
            displayObservations(data);
            renderChart(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            loadingIndicator.innerHTML = '<p class="text-danger">Не получается загрузить данные.</p>';
        });

    function displayObservations(data) {
        data.forEach(obs => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';

            const card = document.createElement('div');
            card.className = 'card shadow-sm h-100';

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
            card.appendChild(cardBody);
            col.appendChild(card);
            observationsContainer.appendChild(col);
        });
    }

    function renderChart(data) {
        const plannedCount = data.filter(obs => obs.status === 'future').length;
        const completedCount = data.filter(obs => obs.status !== 'future').length;

        const ctx = document.getElementById('observationsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Planned', 'Completed'],
                datasets: [{
                    label: '# of Observations',
                    data: [plannedCount, completedCount],
                    backgroundColor: ['rgba(255, 193, 7, 0.6)', 'rgba(40, 167, 69, 0.6)'],
                    borderColor: ['rgba(255, 193, 7, 1)', 'rgba(40, 167, 69, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
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
});