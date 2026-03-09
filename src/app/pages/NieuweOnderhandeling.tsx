import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { toast, Toaster } from "sonner";
import Sidebar from "../components/Sidebar";
import MarktLadingDetailSidebar from "../components/MarktLadingDetailSidebar";
import svgPaths from "../../imports/svg-356h5rlxig";
import Checkbox from "../components/Checkbox";
import RadioButton from "../components/RadioButton";
import Button from "../components/Button";
import RelatieSearchInput from "../components/RelatieSearchInput";
import ItemOfferCard from "../components/ItemOfferCard";
import { get, list, type Relatie, type ContactPersoon } from "../data/api";

interface NegotiationFormData {
  relation: string;
  bidType: 'uitgaand' | 'inkomend';
  remark: string;
  tonnage: string;
  tonnageUnit: 'Ton' | 'm³';
  price: string;
  priceUnit: 'Per ton' | 'Per m³' | 'Blokracht';
  loadingLaytime: boolean;
  loadingDays: string;
  loadingWaitingTime: 'Uren' | 'Dagen';
  loadingLiggeld: string;
  loadingLiggeldDuwvaak: boolean;
  unloadingLaytime: boolean;
  unloadingDays: string;
  unloadingWaitingTime: 'Uren' | 'Dagen';
  unloadingLiggeld: string;
  unloadingLiggeldDuwvaak: boolean;
  sendByEmail: boolean;
}

/* ── Breadcrumb chevron ── */
function BreadcrumbChevron() {
  return (
    <svg className="block size-[16px]" fill="none" viewBox="0 0 16 16">
      <path d="M6 4L10 8L6 12" stroke="#D0D5DD" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
    </svg>
  );
}

/* ── Plus icon ── */
const PlusIcon = () => (
  <svg fill="none" viewBox="0 0 20 20">
    <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
  </svg>
);

/* ── Form card wrapper ── */
function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white relative rounded-[12px] w-full">
      <div aria-hidden="true" className="absolute border border-rdj-border-secondary border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="p-[24px] flex flex-col gap-[20px]">
        <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[28px] text-rdj-text-primary text-[18px]">
          {title}
        </p>
        {children}
      </div>
    </div>
  );
}

export default function NieuweOnderhandeling() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect entity type from route path
  const isVaartuig = location.pathname.includes("/vaartuig/");

  // Get match info from location state if coming from inbox
  const matchCompany = location.state?.matchCompany || '';
  const matchContact = location.state?.matchContact || '';

  const [selectedRelatie, setSelectedRelatie] = useState<{ id: string; naam: string } | null>(
    matchCompany ? { id: 'from-match', naam: matchCompany } : null
  );

  // Item offer state (vaartuig for lading, lading for vaartuig)
  const [offeredItem, setOfferedItem] = useState<{ id: string; naam: string; subtext: string; meta?: string } | null>(null);

  // Contact personen state
  const [contacts, setContacts] = useState<ContactPersoon[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactPersoon | null>(null);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);
  const contactDropdownRef = useRef<HTMLDivElement>(null);

  // Close contact dropdown when clicking outside
  useEffect(() => {
    if (!contactDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(e.target as Node)) {
        setContactDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contactDropdownOpen]);

  // Fetch contacts when relatie changes
  useEffect(() => {
    if (!selectedRelatie) {
      setContacts([]);
      setSelectedContact(null);
      return;
    }

    const fetchContacts = async () => {
      setContactsLoading(true);
      setSelectedContact(null);
      try {
        const allRelaties = await list<Relatie>("relatie");
        const realRelatie = allRelaties.find(r => r.naam === selectedRelatie.naam);
        
        if (realRelatie && realRelatie.contactPersoonIds?.length > 0) {
          const contactPromises = realRelatie.contactPersoonIds.map(cpId =>
            get<ContactPersoon>("contact_persoon", cpId)
          );
          const fetchedContacts = await Promise.all(contactPromises);
          setContacts(fetchedContacts.filter(Boolean));
        } else {
          setContacts([]);
        }
      } catch (err) {
        console.error("Error fetching contacts for relatie:", err);
        setContacts([]);
      } finally {
        setContactsLoading(false);
      }
    };

    fetchContacts();
  }, [selectedRelatie]);

  const [formData, setFormData] = useState<NegotiationFormData>({
    relation: matchCompany,
    bidType: 'uitgaand',
    remark: '',
    tonnage: '',
    tonnageUnit: 'Ton',
    price: '',
    priceUnit: 'Per ton',
    loadingLaytime: false,
    loadingDays: '',
    loadingWaitingTime: 'Uren',
    loadingLiggeld: 'Niet van toepassing',
    loadingLiggeldDuwvaak: false,
    unloadingLaytime: false,
    unloadingDays: '',
    unloadingWaitingTime: 'Uren',
    unloadingLiggeld: 'Niet van toepassing',
    unloadingLiggeldDuwvaak: false,
    sendByEmail: false,
  });

  // Mock cargo data for the sidebar
  const mockCargoData = {
    vesselName: 'm/v Merganser',
    vesselCompany: matchCompany || 'Cargo Solutions Ltd.',
    status: 'Onderhandeling',
    cargo: '2.000 ton Houtpellets',
    from: 'Rotterdam',
    fromDate: 'Do 15 Jan',
    to: 'Mannheim',
    toDate: 'Af te stemmen',
    contact: matchContact || 'Frits van Oost',
  };

  const handleSubmit = () => {
    const fromInbox = location.state?.fromInbox;
    
    if (fromInbox) {
      toast.success('Lading naar pijplijn verplaatst', {
        description: 'De onderhandeling is gestart en de lading is verplaatst naar de pijplijn.',
        duration: 3000,
      });
      navigate(`/markt/pijplijn/${id}`);
    } else {
      navigate(-1);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Determine the breadcrumb context
  const fromInbox = location.state?.fromInbox;
  const parentPath = fromInbox
    ? `/markt/inbox/${isVaartuig ? 'vaartuig' : 'lading'}/${id}`
    : location.pathname.includes('/pijplijn/')
      ? `/markt/pijplijn/${isVaartuig ? 'vaartuig/' : ''}${id}`
      : `/markt/bevrachting/${isVaartuig ? 'vaartuig' : 'lading'}/${id}`;

  const parentLabel = fromInbox ? 'Inbox' : location.pathname.includes('/pijplijn/') ? 'Pijplijn' : 'Bevrachting';

  return (
    <div className="flex min-h-screen bg-white">
      <Toaster position="top-right" richColors />
      <Sidebar />
      
      <div className="flex-1 flex">
        {/* Main content area - Form */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Page Header */}
          <div className="border-b border-rdj-border-secondary px-[32px] py-[24px]">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-[8px] mb-[20px]">
              <button 
                onClick={() => navigate('/markt/bevrachting')}
                className="flex items-center justify-center p-[4px] rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover"
              >
                <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-secondary text-[14px] whitespace-nowrap">Markt</p>
              </button>
              <BreadcrumbChevron />
              <button 
                onClick={() => navigate(parentPath)}
                className="flex items-center justify-center px-[8px] py-[4px] rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover"
              >
                <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-secondary text-[14px] whitespace-nowrap">{parentLabel}</p>
              </button>
              <BreadcrumbChevron />
              <button 
                onClick={() => navigate(parentPath)}
                className="flex items-center justify-center px-[8px] py-[4px] rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover"
              >
                <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-secondary text-[14px] whitespace-nowrap">{id?.substring(0, 12)}</p>
              </button>
              <BreadcrumbChevron />
              <div className="bg-rdj-bg-secondary flex items-center justify-center px-[8px] py-[4px] rounded-[6px] shrink-0">
                <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px] whitespace-nowrap">Nieuwe onderhandeling</p>
              </div>
            </div>

            {/* Title */}
            <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[38px] text-rdj-text-primary text-[30px]">
              Nieuwe onderhandeling toevoegen
            </p>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[800px] mx-auto px-[32px] py-[32px] flex flex-col gap-[24px]">

              {/* ── Card: Relatie ── */}
              <FormCard title="Relatie">
                <div>
                  <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Relatie *
                  </p>
                  <RelatieSearchInput
                    value={selectedRelatie}
                    onSelect={(relatie) => {
                      setSelectedRelatie(relatie);
                      setFormData({ ...formData, relation: relatie?.naam || '' });
                    }}
                    placeholder="Voeg relatie toe"
                  />
                </div>

                {/* Contact dropdown - shown when relatie is selected */}
                {selectedRelatie && (
                  <div>
                    <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                      Contactpersoon
                    </p>
                    <div className="relative" ref={contactDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setContactDropdownOpen(!contactDropdownOpen)}
                        className={`bg-white border rounded-[8px] w-full px-[14px] py-[10px] flex items-center justify-between cursor-pointer transition-colors ${
                          contactDropdownOpen ? 'border-rdj-fg-brand ring-1 ring-rdj-fg-brand' : 'border-rdj-border-primary'
                        }`}
                      >
                        <p className={`font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] text-[14px] ${
                          selectedContact ? 'text-rdj-text-primary' : 'text-rdj-text-tertiary'
                        }`}>
                          {contactsLoading
                            ? 'Laden...'
                            : selectedContact
                              ? selectedContact.naam
                              : contacts.length > 0
                                ? 'Selecteer een contactpersoon...'
                                : 'Geen contactpersonen beschikbaar'
                          }
                        </p>
                        <div className="overflow-clip relative shrink-0 size-[20px] text-rdj-fg-secondary">
                          <svg className={`block size-full transition-transform ${contactDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 20 20">
                            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                          </svg>
                        </div>
                      </button>

                      {contactDropdownOpen && contacts.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-[4px] bg-white border border-rdj-border-secondary rounded-[8px] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] overflow-hidden">
                          {contacts.map((contact) => (
                            <button
                              key={contact.id}
                              onClick={() => {
                                setSelectedContact(contact);
                                setContactDropdownOpen(false);
                              }}
                              className={`w-full text-left px-[14px] py-[10px] flex flex-col gap-[2px] hover:bg-rdj-bg-primary-hover transition-colors ${
                                selectedContact?.id === contact.id ? 'bg-rdj-bg-brand' : ''
                              }`}
                            >
                              <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] text-rdj-text-primary text-[14px]">
                                {contact.naam}
                              </p>
                              {contact.email && (
                                <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[18px] text-rdj-text-secondary text-[12px]">
                                  {contact.email}
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </FormCard>

              {/* ── Card: Bod ── */}
              <FormCard title="Bod">
                {/* Type bod */}
                <div>
                  <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[8px]">
                    Type bod *
                  </p>
                  <div className="flex gap-[16px]">
                    <RadioButton
                      checked={formData.bidType === 'uitgaand'}
                      onChange={() => setFormData({ ...formData, bidType: 'uitgaand' })}
                      label="Uitgaand"
                      icon={
                        <div className="overflow-clip relative size-[20px]">
                          <svg className="block size-full" fill="none" viewBox="0 0 20 20">
                            <path d={svgPaths.p39d66500} stroke="#2E90FA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667"/>
                          </svg>
                        </div>
                      }
                    />
                    <RadioButton
                      checked={formData.bidType === 'inkomend'}
                      onChange={() => setFormData({ ...formData, bidType: 'inkomend' })}
                      label="Inkomend"
                      icon={
                        <div className="overflow-clip relative size-[20px]">
                          <svg className="block size-full" fill="none" viewBox="0 0 20 20">
                            <path d="M18.3333 6.66667L10 12.5L1.66667 6.66667M3.16667 2.5H16.8333C17.9333 2.5 18.8333 3.4 18.8333 4.5V15.5C18.8333 16.6 17.9333 17.5 16.8333 17.5H3.16667C2.06667 17.5 1.16667 16.6 1.16667 15.5V4.5C1.16667 3.4 2.06667 2.5 3.16667 2.5Z" stroke="#2E90FA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667"/>
                          </svg>
                        </div>
                      }
                    />
                  </div>
                </div>

                {/* Aangeboden vaartuig/lading */}
                <ItemOfferCard
                  type={isVaartuig ? "lading" : "vaartuig"}
                  value={offeredItem}
                  onChange={setOfferedItem}
                  label={isVaartuig ? "Aangeboden lading" : "Aangeboden vaartuig"}
                />

                {/* Opmerking */}
                <div>
                  <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Opmerking *
                  </p>
                  <textarea
                    value={formData.remark}
                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                    className="bg-white border border-rdj-border-primary rounded-[8px] w-full px-[14px] py-[10px] font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[24px] text-rdj-text-primary text-[16px] resize-none h-[120px] focus:outline-none focus:ring-1 focus:ring-rdj-fg-brand focus:border-rdj-fg-brand"
                    placeholder="Voeg een opmerking toe..."
                  />
                </div>

                {/* Tonnage */}
                <div>
                  <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Tonnage
                  </p>
                  <div className="flex gap-[12px] items-center">
                    <input
                      type="text"
                      value={formData.tonnage}
                      onChange={(e) => setFormData({ ...formData, tonnage: e.target.value })}
                      className="bg-white border border-rdj-border-primary rounded-[8px] flex-1 px-[14px] py-[10px] font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[24px] text-rdj-text-primary text-[16px] focus:outline-none focus:ring-1 focus:ring-rdj-fg-brand focus:border-rdj-fg-brand"
                    />
                    <div className="flex items-center gap-[8px]">
                      <RadioButton
                        checked={formData.tonnageUnit === 'Ton'}
                        onChange={() => setFormData({ ...formData, tonnageUnit: 'Ton' })}
                        label="Ton"
                      />
                      <RadioButton
                        checked={formData.tonnageUnit === 'm³'}
                        onChange={() => setFormData({ ...formData, tonnageUnit: 'm³' })}
                        label="m³"
                      />
                    </div>
                  </div>
                </div>

                {/* Vrachtprijs */}
                <div>
                  <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Vrachtprijs
                  </p>
                  <div className="flex gap-[12px] items-center">
                    <div className="bg-white border border-rdj-border-primary rounded-[8px] flex items-center overflow-hidden flex-1">
                      <div className="px-[14px] py-[10px] bg-rdj-bg-secondary border-r border-rdj-border-primary">
                        <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[24px] text-rdj-text-primary text-[16px]">€</p>
                      </div>
                      <input
                        type="text"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="flex-1 px-[14px] py-[10px] font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[24px] text-rdj-text-primary text-[16px] focus:outline-none"
                      />
                    </div>
                    <select
                      value={formData.priceUnit}
                      onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value as any })}
                      className="bg-white border border-rdj-border-primary rounded-[8px] px-[14px] py-[10px] font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[24px] text-rdj-text-primary text-[16px] focus:outline-none focus:ring-1 focus:ring-rdj-fg-brand focus:border-rdj-fg-brand"
                    >
                      <option>Per ton</option>
                      <option>Per m³</option>
                      <option>Blokracht</option>
                    </select>
                  </div>
                </div>
              </FormCard>

              {/* ── Card: Laden ── */}
              <FormCard title="Laden">
                {/* Laadtijd */}
                <div>
                  <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Laadtijd
                  </p>
                  <div className="mb-[12px]">
                    <Checkbox
                      checked={formData.loadingLaytime}
                      onChange={(checked) => setFormData({ ...formData, loadingLaytime: checked })}
                      label="Uren conform Nederlands Wettelijk"
                    />
                  </div>
                  <div className="flex gap-[12px] items-end">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.loadingDays}
                        onChange={(e) => setFormData({ ...formData, loadingDays: e.target.value })}
                        className="bg-white border border-rdj-border-primary rounded-[8px] w-full px-[14px] py-[10px] font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[24px] text-rdj-text-primary text-[16px] focus:outline-none focus:ring-1 focus:ring-rdj-fg-brand focus:border-rdj-fg-brand"
                      />
                    </div>
                    <div className="flex gap-[8px]">
                      <RadioButton
                        checked={formData.loadingWaitingTime === 'Uren'}
                        onChange={() => setFormData({ ...formData, loadingWaitingTime: 'Uren' })}
                        label="Uren"
                      />
                      <RadioButton
                        checked={formData.loadingWaitingTime === 'Dagen'}
                        onChange={() => setFormData({ ...formData, loadingWaitingTime: 'Dagen' })}
                        label="Dagen"
                      />
                    </div>
                  </div>
                </div>

                {/* Liggeld laden */}
                <div>
                  <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Liggeld laden
                  </p>
                  <select
                    value={formData.loadingLiggeld}
                    onChange={(e) => setFormData({ ...formData, loadingLiggeld: e.target.value })}
                    className="bg-white border border-rdj-border-primary rounded-[8px] w-full px-[14px] py-[10px] font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[24px] text-rdj-text-primary text-[16px] focus:outline-none focus:ring-1 focus:ring-rdj-fg-brand focus:border-rdj-fg-brand mb-[8px]"
                  >
                    <option>Niet van toepassing</option>
                    <option>Nederlands Wettelijk</option>
                  </select>
                  <Checkbox
                    checked={formData.loadingLiggeldDuwvaak}
                    onChange={(checked) => setFormData({ ...formData, loadingLiggeldDuwvaak: checked })}
                    label="Duwvaak gelijk aan motorschepen"
                  />
                </div>
              </FormCard>

              {/* ── Card: Lossen ── */}
              <FormCard title="Lossen">
                {/* Lostijd */}
                <div>
                  <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Lostijd
                  </p>
                  <div className="mb-[12px]">
                    <Checkbox
                      checked={formData.unloadingLaytime}
                      onChange={(checked) => setFormData({ ...formData, unloadingLaytime: checked })}
                      label="Uren conform Nederlands Wettelijk"
                    />
                  </div>
                  <div className="flex gap-[12px] items-end">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.unloadingDays}
                        onChange={(e) => setFormData({ ...formData, unloadingDays: e.target.value })}
                        className="bg-white border border-rdj-border-primary rounded-[8px] w-full px-[14px] py-[10px] font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[24px] text-rdj-text-primary text-[16px] focus:outline-none focus:ring-1 focus:ring-rdj-fg-brand focus:border-rdj-fg-brand"
                      />
                    </div>
                    <div className="flex gap-[8px]">
                      <RadioButton
                        checked={formData.unloadingWaitingTime === 'Uren'}
                        onChange={() => setFormData({ ...formData, unloadingWaitingTime: 'Uren' })}
                        label="Uren"
                      />
                      <RadioButton
                        checked={formData.unloadingWaitingTime === 'Dagen'}
                        onChange={() => setFormData({ ...formData, unloadingWaitingTime: 'Dagen' })}
                        label="Dagen"
                      />
                    </div>
                  </div>
                </div>

                {/* Liggeld lossen */}
                <div>
                  <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px] mb-[6px]">
                    Liggeld lossen
                  </p>
                  <select
                    value={formData.unloadingLiggeld}
                    onChange={(e) => setFormData({ ...formData, unloadingLiggeld: e.target.value })}
                    className="bg-white border border-rdj-border-primary rounded-[8px] w-full px-[14px] py-[10px] font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[24px] text-rdj-text-primary text-[16px] focus:outline-none focus:ring-1 focus:ring-rdj-fg-brand focus:border-rdj-fg-brand mb-[8px]"
                  >
                    <option>Niet van toepassing</option>
                    <option>Nederlands Wettelijk</option>
                  </select>
                  <Checkbox
                    checked={formData.unloadingLiggeldDuwvaak}
                    onChange={(checked) => setFormData({ ...formData, unloadingLiggeldDuwvaak: checked })}
                    label="Duwvaak gelijk aan motorschepen"
                  />
                </div>
              </FormCard>

              {/* Overige condities button */}
              <Button
                variant="secondary"
                label="Overige condities"
                leadingIcon={<PlusIcon />}
                className="self-start [&_p]:!text-rdj-text-brand [&_svg_path]:!stroke-rdj-fg-brand"
              />

            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-rdj-border-secondary px-[32px] py-[16px] flex justify-between items-center">
            <label className="flex items-center gap-[12px] cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.sendByEmail}
                  onChange={(e) => setFormData({ ...formData, sendByEmail: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-[36px] h-[20px] rounded-full transition-colors ${
                  formData.sendByEmail ? 'bg-rdj-fg-brand' : 'bg-[#d0d5dd]'
                }`}>
                  <div className={`w-[16px] h-[16px] bg-white rounded-full shadow-sm transition-transform duration-200 mt-[2px] ${
                    formData.sendByEmail ? 'ml-[18px]' : 'ml-[2px]'
                  }`} />
                </div>
              </div>
              <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px]">
                Aanbidding per mail versturen
              </p>
            </label>
            <div className="flex gap-[12px]">
              <Button variant="secondary" label="Annuleren" onClick={handleCancel} />
              <Button variant="primary" label="Toevoegen" onClick={handleSubmit} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Cargo Detail */}
      <MarktLadingDetailSidebar cargoData={mockCargoData} />
    </div>
  );
}
