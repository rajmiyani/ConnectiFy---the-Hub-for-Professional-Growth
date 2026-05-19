import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ProfileAnalytics = ({ data }) => {
    if (!data) return (
        <div className="card glass mb-4 p-4 text-center">
            <div className="skeleton-pulse skeleton-rect" style={{ height: '240px' }}></div>
        </div>
    );
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1c1e21',
                bodyColor: '#65676b',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                bodyFont: {
                    size: 13,
                },
                padding: 10,
                displayColors: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#9ca3af',
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(229, 231, 235, 0.5)',
                    borderDash: [5, 5],
                },
                ticks: {
                    color: '#9ca3af',
                },
                border: {
                    display: false,
                },
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
    };

    const labels = data.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const chartData = {
        labels,
        datasets: [
            {
                fill: true,
                label: 'Profile Views',
                data: data?.viewsData || [12, 19, 15, 25, 22, 30, 45],
                borderColor: 'rgb(0, 115, 177)',
                backgroundColor: 'rgba(0, 115, 177, 0.1)',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: 'rgb(0, 115, 177)',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
            },
        ],
    };

    return (
        <div className="card glass mb-4">
            <div className="card-header border-0 pb-0 d-flex justify-content-between align-items-center bg-transparent">
                <div>
                    <h5 className="mb-0 fw-bold">Profile Analytics</h5>
                    <p className="small text-muted mb-0">Profile views in the last 7 days</p>
                </div>
                <div className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                    {data?.trend || '+24% vs last week'}
                </div>
            </div>
            <div className="card-body" style={{ height: '240px' }}>
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
};

export default ProfileAnalytics;