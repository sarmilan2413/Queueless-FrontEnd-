import { EditBookingClient } from './EditBookingClient';

type PageProps = {
  params: {
    id: string;
  };
};

export default function EditBookingPage({ params }: PageProps) {
  return <EditBookingClient id={params.id} />;
}
