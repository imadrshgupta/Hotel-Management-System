import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staysApi, roomsApi, reservationsApi } from "@/services/api";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { RoomSelector } from "@/components/ui/RoomSelector";
import { GuestSelector } from "@/components/ui/GuestSelector";
import { useAppStore } from "@/store/app.store";
import { CheckCircle2, User, Key, CreditCard } from "lucide-react";
import type { Reservation, Room, Guest } from "@/types";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation?: Reservation | null;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  reservation,
}) => {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(
    reservation?.guests?.[0]?.guest || null
  );
  const [notes, setNotes] = useState("");

  const checkInMutation = useMutation({
    mutationFn: staysApi.checkIn,
    onSuccess: () => {
      addToast("Guest checked in successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      onClose();
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.message || "Check-in failed", "error");
    },
  });

  const handleConfirmCheckIn = () => {
    if (!reservation?.id || !selectedRoom?.id || !selectedGuest?.id) {
      addToast("Please select both guest and room before proceeding.", "warning");
      return;
    }

    checkInMutation.mutate({
      reservation_id: reservation.id,
      room_id: selectedRoom.id,
      guest_id: selectedGuest.id,
      notes,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Guided Check-in: ${reservation?.confirmation_number || "Reservation"}`}
      description="Follow the steps to complete guest check-in."
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={() => setStep((s) => (s - 1) as any)}>
              Back
            </Button>
          ) : <div />}

          {step < 3 ? (
            <Button
              size="sm"
              onClick={() => {
                if (step === 1 && !selectedGuest) {
                  addToast("Please select a guest", "warning");
                  return;
                }
                if (step === 2 && !selectedRoom) {
                  addToast("Please select an available room", "warning");
                  return;
                }
                setStep((s) => (s + 1) as any);
              }}
            >
              Next Step
            </Button>
          ) : (
            <Button
              size="sm"
              variant="success"
              isLoading={checkInMutation.isPending}
              onClick={handleConfirmCheckIn}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Complete Check-In
            </Button>
          )}
        </div>
      }
    >
      {/* Steps Progress Indicator */}
      <div className="flex items-center justify-around pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div className={`flex items-center gap-2 ${step >= 1 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
            1
          </div>
          <span className="text-xs">Guest Details</span>
        </div>
        <div className={`h-px w-12 ${step >= 2 ? "bg-blue-600" : "bg-slate-200"}`} />
        <div className={`flex items-center gap-2 ${step >= 2 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
            2
          </div>
          <span className="text-xs">Room Assignment</span>
        </div>
        <div className={`h-px w-12 ${step >= 3 ? "bg-blue-600" : "bg-slate-200"}`} />
        <div className={`flex items-center gap-2 ${step >= 3 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= 3 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
            3
          </div>
          <span className="text-xs">Confirmation</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Verify Guest Information</h4>
          <GuestSelector
            selectedGuestId={selectedGuest?.id}
            onSelect={setSelectedGuest}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Select Clean Vacant Room</h4>
          <RoomSelector
            selectedRoomId={selectedRoom?.id}
            roomTypeId={reservation?.room_type_id}
            statusFilter="VACANT_CLEAN"
            onSelect={setSelectedRoom}
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 text-xs">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Confirm Check-in Summary</h4>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <p><strong>Guest:</strong> {selectedGuest?.first_name} {selectedGuest?.last_name}</p>
            <p><strong>Assigned Room:</strong> Room {selectedRoom?.number}</p>
            <p><strong>Check-in Date:</strong> {reservation?.check_in_date}</p>
            <p><strong>Check-out Date:</strong> {reservation?.check_out_date}</p>
            <p><strong>Total Advance Paid:</strong> ${reservation?.advance_paid || 0}</p>
          </div>

          <FormField label="Check-in Notes">
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add key card codes, guest preferences, or comments..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </FormField>
        </div>
      )}
    </Modal>
  );
};
