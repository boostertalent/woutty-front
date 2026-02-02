"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateCampaign() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    objectives: [] as string[],
    customObjective: '',
    startDate: '',
    endDate: ''
  });

  const objectivesList = ['Notoriété', 'Engagement', 'Autre', 'Conversion', 'Ventes'];

  useEffect(() => {
    const saved = localStorage.getItem('campaign_step_1');
    if (saved) {
      try { setFormData(JSON.parse(saved)); } 
      catch (e) { console.error("Erreur localStorage", e); }
    }
  }, []);

  useEffect(() => {
    if (formData.title || formData.objectives.length > 0) {
      localStorage.setItem('campaign_step_1', JSON.stringify(formData));
    }
  }, [formData]);

  const handleObjectiveChange = (obj: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.includes(obj)
        ? prev.objectives.filter(i => i !== obj)
        : [...prev.objectives, obj]
    }));
  };

  const isDateRangeValid = () => {
    if (formData.startDate && formData.endDate) {
      return new Date(formData.endDate) >= new Date(formData.startDate);
    }
    return true;
  };

  const isStep1Valid =
    formData.title.trim() !== '' &&
    formData.objectives.length > 0 &&
    formData.startDate !== '' &&
    formData.endDate !== '' &&
    isDateRangeValid() &&
    (formData.objectives.includes('Autre') ? formData.customObjective.trim() !== '' : true);

  return (
    <main data-testid="create-campaign-page">
      <form data-testid="campaign-form">
        <input
          placeholder="Titre"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          data-testid="title-input"
        />
        <div>
          {objectivesList.map(obj => (
            <label key={obj}>
              <input
                type="checkbox"
                checked={formData.objectives.includes(obj)}
                onChange={() => handleObjectiveChange(obj)}
                data-testid={`objective-${obj}`}
              />
              {obj}
            </label>
          ))}
        </div>

        <button
          type="button"
          data-testid="continue-button"
          onClick={() => {
            if (isStep1Valid) setLoading(true);
          }}
          disabled={!isStep1Valid || loading}
        >
          {loading ? <Loader2 className="animate-spin" /> : 'continuer'}
        </button>
      </form>
    </main>
  );
}
