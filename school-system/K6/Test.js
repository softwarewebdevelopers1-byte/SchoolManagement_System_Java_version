import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 25,
    duration: '30s',
};

export default function () {
    const url = 'http://localhost:8000/api/login';

    const payload = JSON.stringify({
    "email":"carlosmaina198@gmail.com",
    "password":"admin123"
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const response = http.post(url, payload, params);

    check(response, {
        'status is 200': (r) => r.status === 200,
    });
}
