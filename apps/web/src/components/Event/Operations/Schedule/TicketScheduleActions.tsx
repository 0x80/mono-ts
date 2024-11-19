import type { Schedule } from "@/firebase/interfaces/events";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";

import GradientButton from "@/components/Materials/GradientButton";
import { Textarea } from "@/components/ui/textarea";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editScheduleFunction } from "@/firebase/functions/events/operations/editSchedule";

export default function TicketAction({
  scheduleItem,
  eventId,
  action,
}: {
  scheduleItem: Schedule;
  eventId: string;
  action: "edit" | "deplete";
}) {
  const [schedule, setSchedule] = useState({
    name: scheduleItem.name,
    description: scheduleItem.description,
    type: scheduleItem.type,
    ticketTotal: scheduleItem.ticketTotal,
    visible: scheduleItem.visible ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await editScheduleFunction({
        name: schedule.name,
        description: schedule.description,
        type: schedule.type,
        ticketTotal: schedule.ticketTotal,
        visible: schedule.visible,
        eventId: eventId,
        action: action,
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <GradientButton
          onClick={() => setOpen(true)}
          color={action === "edit" ? "primary" : "error"}
        >
          {action === "edit" ? "Editar" : "Agotar"}
        </GradientButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {action === "edit" ? "Editar entrada" : "Agotar entrada"}
          </DialogTitle>
          <DialogDescription>
            {action === "edit"
              ? "Edita la entrada aquí y haz clic en Guardar cuando esté listo."
              : "Estás a punto de agotar la entrada. ¿Estás seguro? Después podrás añadir más entradas"}
          </DialogDescription>
        </DialogHeader>
        {action === "edit" && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                disabled
                id="name"
                value={schedule.name}
                className="col-span-3"
                onChange={(e) =>
                  setSchedule({
                    ...schedule,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={schedule.description}
                className="col-span-3"
                rows={4}
                onChange={(e) =>
                  setSchedule({
                    ...schedule,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Select
                defaultValue={schedule.type}
                onValueChange={(value) =>
                  setSchedule({
                    ...schedule,
                    type: value,
                  })
                }
              >
                <SelectTrigger className="w-[180px]" value={schedule.type}>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="double">Doble</SelectItem>
                  <SelectItem value="unique">Único</SelectItem>
                  <SelectItem value="private">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ticketTotal" className="text-right">
                Total de entradas
              </Label>
              <Input
                id="ticketTotal"
                value={schedule.ticketTotal}
                className="col-span-3"
                type="number"
                onChange={(e) =>
                  setSchedule({
                    ...schedule,
                    ticketTotal: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visible" className="text-right">
                Visible
              </Label>
              <Switch
                checked={schedule.visible}
                onCheckedChange={(checked) =>
                  setSchedule({
                    ...schedule,
                    visible: checked,
                  })
                }
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <GradientButton
            color={action === "edit" ? "secondary" : "error"}
            onClick={() => {
              handleAction();
            }}
            loading={loading}
          >
            {action === "edit" ? "Guardar" : "Agotar"}
          </GradientButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
