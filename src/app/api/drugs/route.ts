import { NextResponse } from 'next/server';
import { PAKISTAN_DRUG_DATABASE } from '@/lib/drugDatabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase() || '';

  if (!q) {
    return NextResponse.json({ success: true, data: PAKISTAN_DRUG_DATABASE });
  }

  const filtered = PAKISTAN_DRUG_DATABASE.filter(d => 
    d.genericName.toLowerCase().includes(q) ||
    d.brandNames.some(b => b.toLowerCase().includes(q))
  );

  return NextResponse.json({ success: true, data: filtered });
}
