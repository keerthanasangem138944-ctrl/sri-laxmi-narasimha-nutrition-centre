import React, { useState } from 'react';
import { Card, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Database, 
  ShieldCheck, 
  HardDrive, 
  KeyRound, 
  Copy, 
  Check, 
  ExternalLink,
  Layers,
  Terminal,
  Cpu
} from 'lucide-react';

export const SchemaInspector: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'rls' | 'storage' | 'env' | 'checklist'>('tables');

  const tables = [
    { name: 'profiles', records: 'Users linked to auth.users (ADMIN, CUSTOMER)', rls: 'Self read/update, Admin full' },
    { name: 'business_settings', records: 'Sangem Srivijayalaxmi, 7993367929, 7660990052-2@ybl', rls: 'Public read, Admin update' },
    { name: 'customer_profiles', records: 'DOB, gender, blood group, emergency contact, dietary pref', rls: 'Customer self, Admin full' },
    { name: 'customer_measurements', records: 'Height, weight, age, calculated BMI, body fat %, muscle %, visceral, etc.', rls: 'Customer self read, Admin CRUD' },
    { name: 'health_notes', records: 'Customer reported notes, no disease diagnosis', rls: 'Customer visible, Admin full' },
    { name: 'camps', records: 'Camp name, location, date, timing, max capacity', rls: 'Public read, Admin CRUD' },
    { name: 'camp_customers', records: 'Camp attendance and digital token registrations', rls: 'Customer self, Admin full' },
    { name: 'product_categories', records: 'Nutrition categories (Protein, Micronutrients, etc.)', rls: 'Public read, Admin write' },
    { name: 'products', records: 'Nutritional products, price, stock, SKU, image URL', rls: 'Public active, Admin full' },
    { name: 'addresses', records: 'Customer delivery addresses in India', rls: 'Customer self CRUD, Admin read' },
    { name: 'orders', records: 'Orders, total amount, shipping address, status', rls: 'Customer self, Admin full' },
    { name: 'order_items', records: 'Product lines, quantities, unit prices', rls: 'Customer order owner, Admin full' },
    { name: 'payments', records: 'UPI / Razorpay transactions, status, signatures', rls: 'Customer order owner, Admin full' },
    { name: 'reports', records: 'Customer progress report files and PDFs', rls: 'Customer self read, Admin full' },
    { name: 'audit_logs', records: 'Audit trail for mutations (no secrets stored)', rls: 'Admin read only' },
  ];

  const envVars = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', scope: 'Browser & Server', desc: 'Supabase Project API URL' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', scope: 'Browser & Server', desc: 'Supabase Public Anon Key (RLS enforced)' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', scope: 'Server ONLY', desc: 'Privileged key for admin tasks (Never exposed)' },
    { key: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', scope: 'Browser', desc: 'Domain-restricted Maps Platform API Key' },
    { key: 'RAZORPAY_KEY_ID', scope: 'Server ONLY', desc: 'Razorpay Gateway Public Identifier' },
    { key: 'RAZORPAY_KEY_SECRET', scope: 'Server ONLY', desc: 'Razorpay Server Secret (Never in client)' },
    { key: 'RAZORPAY_WEBHOOK_SECRET', scope: 'Server ONLY', desc: 'HMAC signature verification secret for webhooks' },
    { key: 'GEMINI_API_KEY', scope: 'Server ONLY', desc: 'Google Gemini API key for serverless AI summarization' },
    { key: 'APP_URL', scope: 'Server & Client', desc: 'Canonical URL for redirects and webhooks' },
  ];

  const handleCopyPath = () => {
    navigator.clipboard.writeText('supabase/migrations/00001_initial_schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
              PostgreSQL + Vercel
            </span>
            <span className="text-xs text-gray-500">Master Prompt 1 Architecture</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Database & Architecture Foundation</h1>
          <p className="text-xs text-gray-600">
            15 Production-grade tables with Row Level Security (RLS), Supabase Storage, and Vercel serverless integration.
          </p>
        </div>

        <Button size="sm" variant="secondary" onClick={handleCopyPath}>
          {copied ? <Check className="w-4 h-4 mr-1 text-emerald-600" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? 'Copied Path!' : 'Copy Migration SQL Path'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 text-xs font-medium space-x-4">
        <button
          onClick={() => setActiveTab('tables')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'tables' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>15 Tables & Relations</span>
        </button>
        <button
          onClick={() => setActiveTab('rls')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'rls' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>RLS & Security</span>
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'storage' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Supabase Storage</span>
        </button>
        <button
          onClick={() => setActiveTab('env')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'env' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Environment Keys</span>
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'checklist' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Security Checklist</span>
        </button>
      </div>

      {/* Tab: Tables */}
      {activeTab === 'tables' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 flex justify-between items-center">
            <span>SQL Migration: <code className="font-mono font-semibold text-gray-800">/supabase/migrations/00001_initial_schema.sql</code></span>
            <Badge variant="success">Strictly Typed (types/database.ts)</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Table Name</th>
                  <th className="px-4 py-3">Key Entities & Fields</th>
                  <th className="px-4 py-3">Row Level Security Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tables.map((t) => (
                  <tr key={t.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-800">{t.name}</td>
                    <td className="px-4 py-3 text-gray-700">{t.records}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-[11px]">
                        {t.rls}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: RLS */}
      {activeTab === 'rls' && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <CardHeader title="Row Level Security (RLS) Guarantees" subtitle="Mandatory multi-tenant customer isolation" />
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
              <p>
                <strong>Customer Isolation:</strong> A customer authenticated with token UID <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">auth.uid()</code> can only query and view records where <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">customer_id = get_current_profile_id()</code>. They can never inspect other customers' body measurements, orders, or health notes.
              </p>
              <p>
                <strong>Admin Delegation:</strong> The security definer function <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">public.is_admin()</code> evaluates if the authenticated user possesses the <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">ADMIN</code> role inside <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">public.profiles</code>. Admins (such as Sangem Srivijayalaxmi) have full administrative access to record measurements, manage camps, and view business analytics.
              </p>
              <p>
                <strong>No Insecure Policies:</strong> Unlike novice configurations that allow "all authenticated users to read everything", every single table specifies explicit granular USING and WITH CHECK statements.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Storage */}
      {activeTab === 'storage' && (
        <Card className="space-y-4">
          <CardHeader title="Supabase Storage Architecture" subtitle="3 dedicated buckets with custom RLS" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
              <Badge variant="info">Private</Badge>
              <h4 className="font-bold text-gray-900 font-mono">customer-profiles</h4>
              <p className="text-gray-600">Stores member profile avatars. Upload and read permissions restricted to the individual user and admin.</p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
              <Badge variant="success">Public Read</Badge>
              <h4 className="font-bold text-gray-900 font-mono">product-images</h4>
              <p className="text-gray-600">Product images served via CDN with public read access. Upload and deletion restricted to administrators.</p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
              <Badge variant="warning">Encrypted / Private</Badge>
              <h4 className="font-bold text-gray-900 font-mono">reports</h4>
              <p className="text-gray-600">PDFs and measurement summaries. Downloadable only via authenticated signed URLs or RLS-checked sessions.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Env */}
      {activeTab === 'env' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
            Declared in <code className="font-mono font-semibold">/.env.example</code> (Server-side secrets never committed or sent to client)
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Variable Name</th>
                <th className="px-4 py-3">Execution Scope</th>
                <th className="px-4 py-3">Purpose & Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {envVars.map((e) => (
                <tr key={e.key} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900">{e.key}</td>
                  <td className="px-4 py-3">
                    <Badge variant={e.scope.includes('Server ONLY') ? 'danger' : 'neutral'}>
                      {e.scope}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Tab: Checklist */}
      {activeTab === 'checklist' && (
        <Card className="space-y-4">
          <CardHeader title="Section 41 Security Checklist" subtitle="Verified architecture foundation" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {[
              'No plaintext passwords in PostgreSQL',
              'Supabase Auth handles user credentials',
              'No secrets or private keys exposed in frontend',
              'SUPABASE_SERVICE_ROLE_KEY server-side only',
              'RAZORPAY_KEY_SECRET & WEBHOOK_SECRET server-only',
              'GEMINI_API_KEY server-side only with PII minimization',
              'Row Level Security (RLS) enabled on all 15 tables',
              'Customer isolation strictly enforced',
              'Admin role authorization verified on server actions',
              'Zod schemas with numerical boundaries on measurements',
              'Server-side BMI calculation (Formula verified)',
              'No fake payment verification / cryptographic webhook checks',
              'Audit logs for mutations (no credentials logged)',
              'Vercel serverless execution model without custom Node server',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-emerald-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
