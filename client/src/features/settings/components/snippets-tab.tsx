'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useSettings } from '../context/settings-context';
import { DocumentSnippet } from '../types/settings.types';
import {
  IconFileText,
  IconPlus,
  IconTrash,
  IconEdit,
  IconCopy,
} from '@tabler/icons-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'terms', label: 'Payment Terms' },
  { value: 'notes', label: 'Client Notes' },
  { value: 'payment_schedule', label: 'Payment Schedule' },
  { value: 'revision_policy', label: 'Revision Policy' },
];

export const SnippetsTab: React.FC = () => {
  const { settings, addSnippet, updateSnippet, deleteSnippet } = useSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<DocumentSnippet, 'id'>>({
    title: '',
    category: 'terms',
    content: '',
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      title: '',
      category: 'terms',
      content: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (item: DocumentSnippet) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      content: item.content,
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    if (editingId) {
      updateSnippet(editingId, form);
    } else {
      addSnippet(form);
    }
    setIsOpen(false);
  };

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Clause copied to clipboard');
  };

  return (
    <div className='space-y-6'>
      <Card className='border-border/50 bg-card rounded-xl shadow-xs'>
        <CardHeader className='pb-3 flex flex-row items-center justify-between'>
          <div className='space-y-1'>
            <CardTitle className='text-sm font-semibold flex items-center gap-2 text-foreground'>
              <IconFileText className='h-4 w-4 text-primary' />
              Reusable Terms & Notes Library
            </CardTitle>
            <p className='text-xs text-muted-foreground'>
              Save standard contractual clauses, payment conditions, revision guidelines, and closing thank you notes.
            </p>
          </div>
          <Button
            type='button'
            size='sm'
            onClick={handleOpenAdd}
            className='h-8 text-xs gap-1.5 shadow-xs'
          >
            <IconPlus className='h-3.5 w-3.5' />
            <span>Add Snippet</span>
          </Button>
        </CardHeader>
        <CardContent className='space-y-3 pt-1'>
          {settings.snippets.length === 0 ? (
            <div className='p-8 text-center border border-dashed border-border/80 rounded-xl bg-muted/10'>
              <p className='text-xs font-semibold text-foreground'>No snippets saved</p>
              <p className='text-[11px] text-muted-foreground mt-0.5'>
                Create reusable clauses to speed up quoting and invoicing.
              </p>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={handleOpenAdd}
                className='mt-3 h-8 text-xs gap-1.5'
              >
                <IconPlus className='h-3.5 w-3.5' />
                <span>Add First Snippet</span>
              </Button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3.5'>
              {settings.snippets.map((snp) => (
                <div
                  key={snp.id}
                  className='rounded-xl border border-border/60 bg-card p-4 hover:border-border transition-all duration-200 flex flex-col justify-between space-y-3'
                >
                  <div className='space-y-1.5'>
                    <div className='flex items-start justify-between gap-2'>
                      <div>
                        <h4 className='font-semibold text-xs text-foreground'>
                          {snp.title}
                        </h4>
                        <span className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground capitalize'>
                          {snp.category.replace('_', ' ')}
                        </span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => copyContent(snp.content)}
                          className='h-7 w-7 text-muted-foreground hover:text-foreground'
                          title='Copy content'
                        >
                          <IconCopy className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => handleOpenEdit(snp)}
                          className='h-7 w-7 text-muted-foreground hover:text-foreground'
                        >
                          <IconEdit className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => deleteSnippet(snp.id)}
                          className='h-7 w-7 text-rose-500 hover:text-rose-600'
                        >
                          <IconTrash className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    </div>

                    <p className='text-xs text-muted-foreground leading-relaxed bg-muted/20 p-2.5 rounded-lg border border-border/30 line-clamp-3'>
                      {snp.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-md p-6'>
          <DialogHeader className='pb-2'>
            <DialogTitle className='text-base font-bold'>
              {editingId ? 'Edit Clause Snippet' : 'New Clause Snippet'}
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Add reusable language to populate into document terms or notes.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-1 text-xs'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Snippet Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder='e.g. 50/50 Milestone Deposit'
                className='h-9 text-xs'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Category</Label>
              <Select
                value={form.category}
                onValueChange={(val: any) => setForm({ ...form, category: val })}
              >
                <SelectTrigger className='h-9 text-xs'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className='text-xs'>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium'>Clause Content</Label>
              <Textarea
                rows={4}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder='Enter terms, clauses, or notes text...'
                className='text-xs resize-none leading-relaxed'
                required
              />
            </div>
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setIsOpen(false)}
              className='h-8 text-xs'
            >
              Cancel
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={handleSave}
              className='h-8 text-xs'
            >
              Save Snippet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
