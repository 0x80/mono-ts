import React, { useState } from "react";
import RemoveCircleRoundedIcon from "@mui/icons-material/RemoveCircleRounded";
import GradientButton from "@/components/Materials/GradientButton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { RequiredMetadata } from "@/firebase/interfaces/events";
import { editRequiredMetadataFunction } from "@/firebase/functions/events/operations/editRequiredMetadata";

export function RequiredMetadataAction({
  metadataItem,
  eventId,
  type,
}: {
  metadataItem: RequiredMetadata;
  eventId: string;
  type: "edit" | "add" | "delete";
}) {
  const [requiredMetadata, setRequiredMetadata] = useState({
    name: metadataItem.name,
    label: metadataItem.label,
    options: metadataItem.options?.join(",") ?? "",
    obligatory: metadataItem.obligatory ?? true,
    type: metadataItem.type,
    fillable: metadataItem.fillable ?? false,
  });

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await editRequiredMetadataFunction({
        requiredMetadata: {
          ...requiredMetadata,
          options: requiredMetadata.options.split(","),
        },
        action: type,
        eventId,
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (value: string) => {
    setRequiredMetadata({
      ...requiredMetadata,
      type: value,
      fillable: value === "text" ? requiredMetadata.fillable : false,
      options: value === "select" ? "" : requiredMetadata.options,
    });
  };

  return type === "delete" ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <RemoveCircleRoundedIcon
          onClick={() => setOpen(true)}
          color={"error"}
          className="cursor-pointer"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Estás seguro de que quieres eliminar este campo?
          </DialogTitle>
          <DialogDescription>
            No podrás recuperar la información una vez eliminada.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <GradientButton
            color="error"
            onClick={() => {
              handleAction();
            }}
            loading={loading}
          >
            Eliminar
          </GradientButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <GradientButton
          onClick={() => setOpen(true)}
          color={type === "edit" ? "primary" : "info"}
        >
          {type === "edit" ? "Editar" : "Añadir"}
        </GradientButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === "edit" ? "Editar " : "Añadir "} información
          </DialogTitle>
          <DialogDescription>
            Edita la información pedida aquí y haz clic en Guardar cuando esté
            listo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input
              id="name"
              value={requiredMetadata.label}
              className="col-span-3"
              onChange={(e) =>
                setRequiredMetadata({
                  ...requiredMetadata,
                  label: e.target.value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tipo
            </Label>
            <Select
              defaultValue={requiredMetadata.type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="select">Selección</SelectItem>
                <SelectItem value="photo">Foto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {requiredMetadata.type === "select" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="options" className="text-right">
                Opciones (separadas por ,)
              </Label>
              <Textarea
                id="options"
                value={requiredMetadata.options}
                className="col-span-3"
                rows={4}
                onChange={(e) =>
                  setRequiredMetadata({
                    ...requiredMetadata,
                    options: e.target.value,
                  })
                }
              />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="obligatory" className="text-right">
              Obligatorio
            </Label>
            <Switch
              checked={requiredMetadata.obligatory}
              onCheckedChange={(checked) =>
                setRequiredMetadata({
                  ...requiredMetadata,
                  obligatory: checked,
                })
              }
            />
          </div>

          {requiredMetadata.type === "text" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fillable" className="text-right">
                Rellenable
              </Label>
              <Switch
                checked={requiredMetadata.fillable}
                onCheckedChange={(checked) =>
                  setRequiredMetadata({
                    ...requiredMetadata,
                    fillable: checked,
                  })
                }
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <GradientButton
            color="secondary"
            onClick={() => {
              handleAction();
            }}
            loading={loading}
          >
            Guardar
          </GradientButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
