import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = await createClient()

  let query = supabase
    .from('jobs')
    .select(
      'id, title_bn, location_bn, salary, currency, application_deadline, countries(name_bn), job_categories(name_bn)'
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (searchParams.q) {
    query = query.ilike('title_bn', `%${searchParams.q}%`)
  }

  const { data } = await query.limit(50)

  return (
    <main className="container-gws py-16">
      <h1 className="text-4xl font-bold text-navy">চাকরির সুযোগ</h1>

      <form className="card mt-7 flex gap-3 p-4">
        <input
          className="input"
          name="q"
          defaultValue={searchParams.q}
          placeholder="চাকরির নাম খুঁজুন"
        />
        <button className="btn-primary">খুঁজুন</button>
      </form>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {data?.map((j: any) => {
          const country = Array.isArray(j.countries)
            ? j.countries[0]
            : j.countries

          return (
            <Link className="card p-6" href={`/jobs/${j.id}`} key={j.id}>
              <h2 className="text-xl font-bold text-navy">{j.title_bn}</h2>
              <p className="mt-2 text-slate-500">
                {country?.name_bn || '—'} • {j.location_bn || '—'}
              </p>
              <p className="mt-4 font-semibold">
                {j.salary
                  ? `${j.salary} ${j.currency || ''}`
                  : 'বেতন আলোচনা সাপেক্ষে'}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                শেষ তারিখ:{' '}
                {j.application_deadline
                  ? new Date(j.application_deadline).toLocaleDateString('bn-IN')
                  : '—'}
              </p>
            </Link>
          )
        })}

        {(!data || data.length === 0) && (
          <p className="text-slate-500 md:col-span-2">
            দুঃখিত, কোনো চাকরির সুযোগ পাওয়া যায়নি।
          </p>
        )}
      </div>
    </main>
  )
}