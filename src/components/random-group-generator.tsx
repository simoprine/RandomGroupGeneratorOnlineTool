
"use client";

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Copy, Download, Shuffle, Trash2, Split, AlertCircle, UsersRound, ListChecks, Spline } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { Separator } from './ui/separator';
import { ModeToggle } from './theme-toggle';

export function RandomGroupGenerator() {
  const [listInput, setListInput] = useState('');
  const [splitBy, setSplitBy] = useState<'groups' | 'items'>('groups');
  const [splitValue, setSplitValue] = useState('2');
  const [randomize, setRandomize] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [outputGroups, setOutputGroups] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [duplicatesRemovedCount, setDuplicatesRemovedCount] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSplit = useCallback(() => {
    setError(null);
    setDuplicatesRemovedCount(null);

    let items = listInput.split('\n').map(item => item.trim()).filter(item => item);

    if (items.length === 0) {
      setError("Your input list is empty. Please add some items.");
      setOutputGroups([]);
      return;
    }
    
    if (removeDuplicates) {
      const uniqueItems = [...new Set(items)];
      setDuplicatesRemovedCount(items.length - uniqueItems.length);
      items = uniqueItems;
    }

    if (randomize) {
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
    }
    
    const numValue = parseInt(splitValue, 10);
    if (isNaN(numValue) || numValue <= 0) {
      setError("Please enter a valid, positive number for splitting.");
      setOutputGroups([]);
      return;
    }

    if (items.length > 0 && numValue > items.length) {
      setError(`The split value (${numValue}) cannot be greater than the number of items (${items.length}).`);
      setOutputGroups([]);
      return;
    }
    
    if (items.length === 0) {
      setOutputGroups([]);
      return;
    }

    const newGroups: string[][] = [];

    if (splitBy === 'groups') {
      for (let i = 0; i < numValue; i++) newGroups.push([]);
      items.forEach((item, index) => {
        newGroups[index % numValue].push(item);
      });
    } else {
      for (let i = 0; i < items.length; i += numValue) {
        newGroups.push(items.slice(i, i + numValue));
      }
    }

    setOutputGroups(newGroups);
  }, [listInput, splitBy, splitValue, randomize, removeDuplicates]);
  
  const handleCopy = useCallback(async (group: string[], index: number) => {
    const textToCopy = group.join('\n');
    await navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Group Copied!",
      description: `Group ${index + 1} has been copied to your clipboard.`,
    })
  }, [toast]);

  const handleDownload = useCallback((group: string[], index: number) => {
    const csvContent = group.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `group_${index + 1}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const itemCount = useMemo(() => {
    return listInput.split('\n').map(item => item.trim()).filter(item => item).length;
  }, [listInput]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="relative text-center mb-8 md:mb-12">
        <div className="absolute top-0 right-0">
          <ModeToggle />
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Random Group Generator</h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2 max-w-2xl mx-auto">
          Paste your list, choose your options, and generate groups instantly.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-2xl">1. Input Your List</CardTitle>
                <span className="text-sm font-medium text-muted-foreground">
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </span>
              </div>
              <CardDescription>Enter each item on a new line.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Apples\nOranges\nBananas\nGrapes\nStrawberries\nBlueberries"
                className="min-h-[200px] text-base"
                value={listInput}
                onChange={(e) => setListInput(e.target.value)}
              />
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">2. Set Options</CardTitle>
              <CardDescription>Define how you want to generate groups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="font-medium text-base mb-2 block">Split By</Label>
                <RadioGroup value={splitBy} onValueChange={(value: 'groups' | 'items') => setSplitBy(value)} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="groups" id="groups" />
                    <Label htmlFor="groups" className="flex items-center gap-2 cursor-pointer"><UsersRound className="h-5 w-5"/> Number of Groups</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="items" id="items" />
                    <Label htmlFor="items" className="flex items-center gap-2 cursor-pointer"><ListChecks className="h-5 w-5"/> Items per Group</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Input
                type="number"
                value={splitValue}
                onChange={(e) => setSplitValue(e.target.value)}
                min="1"
                placeholder={splitBy === 'groups' ? 'e.g., 3' : 'e.g., 5'}
                className="text-base"
              />
              <Separator />
               <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="randomize" checked={randomize} onCheckedChange={(checked) => setRandomize(Boolean(checked))} />
                  <Label htmlFor="randomize" className="flex items-center gap-2 font-normal cursor-pointer"><Shuffle className="h-5 w-5" /> Randomize order</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="deduplicate" checked={removeDuplicates} onCheckedChange={(checked) => {
                    setRemoveDuplicates(Boolean(checked));
                    if (!Boolean(checked)) {
                      setDuplicatesRemovedCount(null);
                    }
                  }} />
                  <Label htmlFor="deduplicate" className="flex items-center gap-2 font-normal cursor-pointer"><Trash2 className="h-5 w-5" /> Remove duplicates</Label>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button onClick={handleSplit} size="lg" className="w-full text-lg py-6 shadow-lg">
            <Split className="mr-2 h-5 w-5"/> Generate Groups
          </Button>
        </div>
        
        <div className="lg:col-span-3">
          <h2 className="font-headline text-3xl font-bold mb-4">3. Your Groups</h2>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {duplicatesRemovedCount !== null && duplicatesRemovedCount > 0 && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Duplicates Removed</AlertTitle>
              <AlertDescription>
                {duplicatesRemovedCount} duplicate item{duplicatesRemovedCount !== 1 ? 's were' : ' was'} removed.
              </AlertDescription>
            </Alert>
          )}

          {outputGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50 duration-500">
              {outputGroups.map((group, index) => (
                <Card key={index} className="shadow-md flex flex-col">
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <CardTitle className="font-headline text-xl">Group {index + 1}</CardTitle>
                      <CardDescription>{group.length} items</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(group, index)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(group, index)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ScrollArea className="h-64 rounded-md border p-3">
                      <ul className="space-y-2">
                        {group.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-sm">{item}</li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 h-full min-h-[400px]">
              <div className="bg-primary/20 rounded-full p-4">
                 <Spline className="h-12 w-12 text-primary" />
              </div>
              <p className="mt-4 text-lg font-medium text-muted-foreground">Your generated groups will appear here.</p>
              <p className="text-sm text-muted-foreground">Fill in the details on the left and click "Generate Groups".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

    