import React, { useState } from 'react';
import { X, Globe, Plus, Activity, Clock, Tag } from 'lucide-react';
import { MonitoredWebsite } from '../../types/tarsier';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWebsite: (website: MonitoredWebsite) => void;
}

export function AddWebsiteModal({ isOpen, onClose, onAddWebsite }: AddWebsiteModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<MonitoredWebsite['category']>('E-Commerce');
  const [interval, setInterval] = useState<number>(30);
  const [tags, setTags] = useState('Production, Customer-Facing');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newWebsite: MonitoredWebsite = {
      id: `site-${Date.now()}`,
      name: name.trim(),
      url: formattedUrl,
      category,
      status: 'healthy',
      httpStatus: 200,
      uptimePct24h: 100.0,
      uptimePct30d: 100.0,
      latencyMs: Math.floor(Math.random() * 25) + 18,
      latencyP95Ms: 42,
      latencyP99Ms: 68,
      sslValid: true,
      sslExpiryDays: 90,
      sslIssuer: "Let's Encrypt Authority E6",
      lastCheckSecondsAgo: 1,
      checkIntervalSeconds: interval,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      activeIncidentCount: 0,
      regions: [
        { region: 'us-east', name: 'N. Virginia (US-East)', latencyMs: 20, status: 'healthy' },
        { region: 'us-west', name: 'Oregon (US-West)', latencyMs: 24, status: 'healthy' },
        { region: 'eu-central', name: 'Frankfurt (EU-Central)', latencyMs: 28, status: 'healthy' },
        { region: 'ap-northeast', name: 'Tokyo (AP-Northeast)', latencyMs: 35, status: 'healthy' },
        { region: 'ap-southeast', name: 'Sydney (AP-Southeast)', latencyMs: 42, status: 'healthy' },
      ],
      historicalLatency: [
        { time: '13:00', latencyMs: 22, statusCode: 200 },
        { time: '13:10', latencyMs: 24, statusCode: 200 },
        { time: '13:20', latencyMs: 21, statusCode: 200 },
        { time: '13:30', latencyMs: 25, statusCode: 200 },
        { time: '13:40', latencyMs: 23, statusCode: 200 },
        { time: '13:50', latencyMs: 22, statusCode: 200 },
        { time: '14:00', latencyMs: 24, statusCode: 200 },
        { time: '14:10', latencyMs: 22, statusCode: 200 },
      ],
    };

    onAddWebsite(newWebsite);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0D0D10] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#007AFF]/20 border border-[#007AFF]/40 flex items-center justify-center text-[#007AFF]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Add Website to Night Guard</h3>
            <p className="text-xs text-neutral-400">Continuous 24/7 autonomous health & incident surveillance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Friendly Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production Billing Gateway"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#15151A] border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#007AFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Target URL</label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://billing.example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#15151A] border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#007AFF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#15151A] border border-white/10 text-sm text-white focus:outline-none focus:border-[#007AFF]"
              >
                <option value="E-Commerce">E-Commerce</option>
                <option value="API Gateway">API Gateway</option>
                <option value="Security">Security</option>
                <option value="Billing">Billing</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Developer">Developer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Check Interval</label>
              <select
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#15151A] border border-white/10 text-sm text-white focus:outline-none focus:border-[#007AFF]"
              >
                <option value={15}>Every 15 seconds (High Pri)</option>
                <option value={30}>Every 30 seconds (Standard)</option>
                <option value={60}>Every 60 seconds (Eco)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Production, Public-Facing, Auth"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#15151A] border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#007AFF]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#007AFF] hover:bg-[#0066D6] text-white text-sm font-semibold shadow-[0_0_20px_rgba(0,122,255,0.3)] transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy Night Guard Surveillance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
