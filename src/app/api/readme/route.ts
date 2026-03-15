import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const readmePath = path.join(process.cwd(), 'README.md');
        const content = fs.readFileSync(readmePath, 'utf8');
        return new NextResponse(content, {
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    } catch (error) {
        return new NextResponse('Error loading README', { status: 500 });
    }
}
