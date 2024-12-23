import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function CardWithAction(props: {
  title: string;
  description: string;
  children?: React.ReactNode;
  action?: {
    label: string;
    handler: () => void;
  };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <CardDescription>{props.description}</CardDescription>
      </CardHeader>
      {props.children && (
        <CardContent className="text-sm">{props.children}</CardContent>
      )}
      {props.action && (
        <CardFooter className="bg-zinc-100 py-4 dark:bg-zinc-800">
          <Button size="sm" onClick={props.action.handler}>
            {props.action.label}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
