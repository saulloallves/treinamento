import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id?: string;
  option_text: string;
  score_value: number;
  option_order: number;
  isNew?: boolean;
}

interface DynamicOptionsEditorProps {
  options: Option[];
  onChange: (options: Option[]) => void;
  disabled?: boolean;
}

export const DynamicOptionsEditor = ({
  options,
  onChange,
  disabled = false
}: DynamicOptionsEditorProps) => {
  const [localOptions, setLocalOptions] = useState<Option[]>(options);

  useEffect(() => {
    setLocalOptions(options.length > 0 ? options : [
      { option_text: "", score_value: 2, option_order: 1, isNew: true },
      { option_text: "", score_value: 0, option_order: 2, isNew: true }
    ]);
  }, [options]);

  const handleAddOption = () => {
    const newOrder = localOptions.length + 1;
    const usedScores = localOptions.map(o => o.score_value);

    let defaultScore = 1;
    for (let i = 0; i <= 10; i++) {
      if (!usedScores.includes(i)) {
        defaultScore = i;
        break;
      }
    }

    const newOptions = [
      ...localOptions,
      {
        option_text: "",
        score_value: defaultScore,
        option_order: newOrder,
        isNew: true
      }
    ];
    setLocalOptions(newOptions);
    onChange(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (localOptions.length <= 2) return;

    const newOptions = localOptions.filter((_, i) => i !== index);
    const reordered = newOptions.map((opt, i) => ({
      ...opt,
      option_order: i + 1
    }));
    setLocalOptions(reordered);
    onChange(reordered);
  };

  const handleTextChange = (index: number, text: string) => {
    const newOptions = [...localOptions];
    newOptions[index] = { ...newOptions[index], option_text: text };
    setLocalOptions(newOptions);
    onChange(newOptions);
  };

  const handleScoreChange = (index: number, score: number) => {
    const newOptions = [...localOptions];
    newOptions[index] = { ...newOptions[index], score_value: score };
    setLocalOptions(newOptions);
    onChange(newOptions);
  };

  const isScoreAvailable = (score: number, currentIndex: number) => {
    return !localOptions.some((opt, i) =>
      i !== currentIndex && opt.score_value === score
    );
  };

  const canAddMore = () => {
    const lastOption = localOptions[localOptions.length - 1];
    return lastOption && lastOption.option_text.trim().length > 0;
  };

  const getScoreBadgeColor = (score: number) => {
    if (score === 0) return "bg-red-100 text-red-800 border-red-200";
    if (score >= 1 && score <= 3) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (score >= 4 && score <= 7) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getScoreLabel = (score: number) => {
    if (score === 0) return "Errada";
    if (score >= 1 && score <= 3) return "Baixa";
    if (score >= 4 && score <= 7) return "Média";
    return "Alta";
  };

  return (
    <div className="space-y-3">
      <Label>Alternativas (mínimo 2)</Label>

      {localOptions.map((option, index) => (
        <div
          key={option.id || `new-${index}`}
          className="flex items-start gap-2 p-3 border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center justify-center w-8 h-9 rounded bg-primary/10 text-primary font-semibold text-sm shrink-0">
            {String.fromCharCode(65 + index)}
          </div>

          <div className="flex-1 space-y-2">
            <Input
              value={option.option_text}
              onChange={(e) => handleTextChange(index, e.target.value)}
              placeholder={`Digite a alternativa ${String.fromCharCode(65 + index)}...`}
              disabled={disabled}
            />

            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                Pontuação:
              </Label>
              <Select
                value={option.score_value.toString()}
                onValueChange={(val) => handleScoreChange(index, parseInt(val))}
                disabled={disabled}
              >
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                    <SelectItem
                      key={score}
                      value={score.toString()}
                      disabled={!isScoreAvailable(score, index)}
                    >
                      {score} pts
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Badge
                variant="outline"
                className={cn("text-xs", getScoreBadgeColor(option.score_value))}
              >
                {getScoreLabel(option.score_value)}
              </Badge>
            </div>
          </div>

          {localOptions.length > 2 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRemoveOption(index)}
              disabled={disabled}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddOption}
        disabled={disabled || !canAddMore()}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-1" />
        Adicionar Alternativa
      </Button>

      {!canAddMore() && localOptions.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Preencha a última alternativa para adicionar mais
        </p>
      )}
    </div>
  );
};
