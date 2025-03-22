
import React, { useState } from 'react';
import MobileLayout from '../components/layouts/MobileLayout';
import { useFlashcards } from '../hooks/useFlashcards';
import FlashcardsList from '../components/flashcards/FlashcardsList';
import FlashcardForm from '../components/flashcards/FlashcardForm';
import FlashcardStudy from '../components/flashcards/FlashcardStudy';
import ModuleFilter from '../components/flashcards/ModuleFilter';
import { BookOpen, Plus, List } from 'lucide-react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  module_id?: string | null;
  user_id: string;
}

const Flashcards: React.FC = () => {
  const { 
    flashcards, 
    modules, 
    isLoading, 
    activeModule, 
    setActiveModule,
    createFlashcard, 
    updateFlashcard, 
    deleteFlashcard 
  } = useFlashcards();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'study'>('list');
  
  const handleEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
    setShowCreateForm(true);
  };
  
  const handleFormSubmit = async (question: string, answer: string, moduleId: string | null) => {
    if (editingFlashcard) {
      await updateFlashcard(editingFlashcard.id, question, answer, moduleId);
      setEditingFlashcard(null);
    } else {
      await createFlashcard(question, answer, moduleId);
    }
    setShowCreateForm(false);
  };
  
  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingFlashcard(null);
  };
  
  const handleToggleView = () => {
    setCurrentView(currentView === 'list' ? 'study' : 'list');
  };
  
  return (
    <MobileLayout title="Flashcards">
      <div className="py-4">
        <div className="w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Flashcards</h1>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleToggleView}
                className="w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center"
              >
                {currentView === 'list' ? (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Study Mode
                  </>
                ) : (
                  <>
                    <List className="w-4 h-4 mr-2" />
                    List View
                  </>
                )}
              </button>
              
              {currentView === 'list' && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  disabled={showCreateForm}
                  className="w-full px-4 py-3 bg-primary text-white rounded-lg flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Flashcard
                </button>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading flashcards...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {showCreateForm ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium mb-4">
                    {editingFlashcard ? 'Edit Flashcard' : 'Create New Flashcard'}
                  </h2>
                  <FlashcardForm
                    modules={modules}
                    initialData={editingFlashcard || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                  />
                </div>
              ) : currentView === 'list' ? (
                <>
                  <ModuleFilter
                    modules={modules}
                    activeModule={activeModule}
                    onModuleChange={setActiveModule}
                  />
                  <FlashcardsList
                    flashcards={flashcards}
                    modules={modules}
                    onEdit={handleEditFlashcard}
                    onDelete={deleteFlashcard}
                  />
                </>
              ) : (
                <FlashcardStudy flashcards={flashcards} />
              )}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Flashcards;
