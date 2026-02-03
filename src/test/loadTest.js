import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 10, // 10 usuarios virtuales
    duration: '30s', // durante 30 segundos
};

export default function () {
    const payload = JSON.stringify({
        email: `usuario${Math.floor(Math.random() * 1000)}@test.com`,
        password: 'Test1234'
    });

    const headers = { 'Content-Type': 'application/json' };

    const res = http.post('http://localhost:3000/api/auth/register', payload, { headers });

    check(res, {
        'status es 201 o 400': (r) => r.status === 201 || r.status === 400
    });

    sleep(1);
}
